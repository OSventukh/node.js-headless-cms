import { Op } from 'sequelize';
import { Topic, Category, Page, sequelize } from '../models/index.js';
import slugifyString from '../utils/slugify.js';
import HttpError from '../utils/http-error.js';
import {
  checkIncludes,
  buildWhereObject,
  getOrder,
  getPagination,
  checkAttributes,
} from '../utils/models.js';

async function getAllChildCategories(categories) {
  let allCategories = [...categories];
  await Promise.all(
    categories.map(async (category) => {
      const childCategories = await category.getChildren();
      allCategories = allCategories.concat(childCategories);
    })
  );
  return allCategories;
}

export const createTopic = async ({ pageId, parentId, ...topicData }) => {
  // Сheck whether the given ids is an array, and if it is not, it converts it into an array.
  const categoriesIds = topicData?.categoryId
    ? Array.from(topicData.categoryId)
    : [];

  try {
    const [topic, categories, page, parentTopic] = await Promise.all([
      Topic.create({
        ...topicData,
        slug: topicData.slug
          ? slugifyString(topicData.slug)
          : slugifyString(topicData.title),
      }),
      Category.findAll({
        where: {
          id: {
            [Op.in]: categoriesIds,
          },
        },
      }),
      Page.findByPk(pageId),
      Topic.findByPk(parentId),
    ]);

    if (parentTopic && topic.children.length > 0) {
      throw new HttpError(
        'This topic contains child topics. Only one level of nesting is allowed.',
        400
      );
    }

    await Promise.all([
      await topic.setCategories(categories),
      await topic.setPage(page),
      topic.id !== parentTopic.id && (await topic.setParent(parentTopic)),
    ]);
    return topic;
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      throw new HttpError(error.message, 400);
    }
    if (error.name === 'SequelizeUniqueConstraintError') {
      const fieldName = Object.entries(error.fields)[0][0];
      const fieldValue = Object.entries(error.fields)[0][1];
      const errorMessage = `The ${fieldName} should be an unique. Value ${fieldValue} is already in use`;
      throw new HttpError(errorMessage, 409);
    }
    throw new HttpError(
      error.message || 'Something went wrong',
      error.statusCode || 500
    );
  }
};

export const getTopics = async (
  whereQuery,
  includeQuery,
  orderQuery,
  page,
  size,
  columns
) => {
  try {
    // Convert provided include query to array and check if it avaible for this model
    const avaibleIncludes = [
      'users',
      'page',
      'posts',
      'categories',
      'parent',
      'children',
    ];
    const include = checkIncludes(includeQuery, avaibleIncludes);

    // Check if provided query avaible for filtering this model
    const avaibleColumns = [
      'id',
      'title',
      'slug',
      'image',
      'description',
      'status',
      'parentId',
      'categories',
      'createdAt',
      'updatedAt',
    ];
    const whereObj = buildWhereObject(whereQuery, avaibleColumns);
    const attributes = checkAttributes(columns, avaibleColumns);

    const order = await getOrder(orderQuery, Topic);

    const { offset, limit } = getPagination(page, size);

    const result = await Topic.findAndCountAll({
      where: {
        ...whereObj,
      },
      include: [
        ...include,
        include.includes('children')
        && attributes?.length > 0 && {
          model: Topic,
          as: 'children',
          attributes: [...attributes, 'id'],
        },
        include.includes('categories') && {
          model: Category,
          as: 'categories',
          where: {
            parentId: null,
          },
          include: [
            {
              model: Category,
              as: 'children',
              required: false,
            },
          ].filter(Boolean),
          required: false,
        },
      ].filter(Boolean),
      order,
      offset,
      limit,
      ...(columns && { attributes: ['id', ...attributes] }),
    });
    return result;
  } catch (error) {
    throw new HttpError(
      error.message || 'Something went wrong',
      error.statusCode || 500
    );
  }
};

export const updateTopic = async (id, { pageId, parentId, ...toUpdate }) => {
  // Сheck whether the given ids is an array, and if it is not, it converts it into an array.
  const categoriesIds = toUpdate.categoryId
    ? Array.from(toUpdate.categoryId)
    : [];

  try {
    const [topic, categories, page, parentTopic] = await Promise.all([
      Topic.findByPk(id, { include: ['children'] }),
      Category.findAll({
        where: {
          id: {
            [Op.in]: categoriesIds,
          },
        },
      }),
      Page.findByPk(pageId),
      Topic.findByPk(parentId),
    ]);

    if (!topic) {
      throw new HttpError('Topic with this id not found', 404);
    }

    if (
      parentTopic && (topic.id === parentTopic.id || parentTopic.parentId === topic.id)
    ) {
      throw new HttpError('This topic cannot be the parent topic', 400);
    }

    if (parentTopic && topic.children.length > 0) {
      throw new HttpError(
        'This topic contains child topics. Only one level of nesting is allowed.',
        400
      );
    }

    if (parentTopic && parentTopic.parentId) {
      throw new HttpError(
        'The topic you want to select as a parent is a child of another topic. Only one level of nesting is allowed.',
        400
      );
    }

    // if (awaittopic.getChildren())
    const categoriesWithChild = await getAllChildCategories(categories);

    const result = await sequelize.transaction(async (transaction) => {
      const updatedData = await Promise.all([
        topic.setCategories(categoriesWithChild, { transaction }),
        topic.setPage(page, { transaction }),
        topic.setParent(parentTopic, { transaction }),
        Topic.update(
          {
            ...toUpdate,
            slug: toUpdate.slug
              ? slugifyString(toUpdate.slug)
              : slugifyString(toUpdate.title),
          },
          {
            where: {
              id,
            },
            transaction,
          }
        ),
      ]);
      return updatedData[1];
    });

    if (result && result[0] === 0) {
      throw new HttpError('Topic was not updated', 400);
    }
  } catch (error) {
    throw new HttpError(
      error.message || 'Something went wrong',
      error.statusCode || 500
    );
  }
};

export const deleteTopic = async (id) => {
  try {
    const topicsId = Array.of(id).flat();
    const topics = await Topic.findAll({
      where: {
        id: {
          [Op.in]: topicsId,
        },
      },
    });

    if (!topics || topics.length === 0) {
      const errorMessage = topicsId.length > 1 ? 'Topics not found' : 'Topic not found';
      throw new HttpError(errorMessage, 404);
    }

    const result = await Topic.destroy({
      where: {
        id: {
          [Op.in]: topicsId,
        },
      },
    });

    if (result === 0) {
      throw new HttpError('Topic was not deleted', 400);
    }

    return result;
  } catch (error) {
    throw new HttpError(
      error.message || 'Something went wrong',
      error.statusCode || 500
    );
  }
};

export const getTopicCategories = async (topicsIds) => {
  try {
    const topics = await Topic.findAll({
      where: {
        id: {
          [Op.in]: topicsIds.split(','),
        },
      },
      include: [
        {
          model: Category,
          as: 'categories',
          include: ['children'],
        },
        {
          model: Category,
          as: 'categories',
          include: ['parent'],
        },
      ],
    });

    const categories = topics.map((topic) => topic.categories).flat();
    return categories;
  } catch (error) {
    throw new HttpError(
      error.message || 'Something went wrong',
      error.statusCode || 500
    );
  }
};
