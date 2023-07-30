import config from '../config/config.js';

export function checkIncludes(includeQuery = '', avaibleIncludes = []) {
  const includeArr = includeQuery.split(',');
  const include = includeArr.filter((item) => avaibleIncludes.includes(item));
  return include;
}

export function checkAttributes(
  attributesQuery = '',
  avaibleAttributes = [],
  exclude = [],
) {
  const includeArr = attributesQuery.split(',');
  const attributes = includeArr.filter(
    (item) => (
      avaibleAttributes.includes(item) && !avaibleAttributes.includes(exclude)
    ),
  );
  return attributes;
}

export function buildWhereObject(whereQuery = {}, avaibleWheres = []) {
  return Object.fromEntries(
    Object.entries(whereQuery).filter(
      ([key, value]) => avaibleWheres.includes(key) && value !== undefined,
    ).map(([key, value]) => [key, value === 'null' ? null : value])
    ,
  );
}

export async function getOrder(orderQuery = '', Model, associations = []) {
  const ordersArr = [];
  if (!orderQuery.includes('createdAt')) {
    ordersArr.push(['createdAt', 'ASC'])
  }
  if (!orderQuery) return ordersArr;
  try {
    const model = await Model.describe();
    orderQuery.split(',').forEach((item) => {
      const [column, direction] = item.split(':');
      // Check if provided column exist in current model to prevent errors
      if (column in model) {
        // direction should be DESC or ASC
        const validDirection = direction.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
        ordersArr.push([column, validDirection]);
      } else {
        // Check if provided column is an association
        const association = associations.find((assoc) => assoc.as === column);
        if (association) {
          // direction should be DESC or ASC
          const validDirection = direction.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
          ordersArr.push([
            { model: association.model, as: association.as },
            association.column,
            validDirection,
          ]);
        }
      }
    });
    return ordersArr;
  } catch (error) {
    return [];
  }
}

export function getPagination(page, size) {
  const limit = +size || config.defaultRecordsPerPage;
  const offset = page && +page > 0 ? +size * (+page - 1) : 0;
  return { limit, offset };
}
