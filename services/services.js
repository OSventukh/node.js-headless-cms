export const createService = async (
  Model,
  data,
) => {
  try {
    console.log(Model)
    const topic = await Model.create(data);
    return topic;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const getService = async (
  Model,
  whereOptions = {},
  includeOptions = [],
  orderOptions = [],
) => {
  try {
    const topics = await Model.findAll({
      where: whereOptions,
      include: includeOptions,
      order: orderOptions,
    });
    return topics;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const updateService = async (Model, toUpdate, whereOptions) => {
  try {
    const result = Model.update(toUpdate, {
      where: whereOptions,
    });

    if (result[0] === 0) {
      throw new Error('Could not update this topic');
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

export const deleteService = async (Model, whereOptions) => {
  try {
    await Model.destroy({
      where: whereOptions,
    });
  } catch (error) {
    throw new Error(error.message);
  }
};
