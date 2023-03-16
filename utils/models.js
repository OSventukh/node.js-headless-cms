export function checkIncludes(includeQuery = '', avaibleIncludes = []) {
  const includeArr = includeQuery.split(',');
  const include = includeArr.filter((item) => avaibleIncludes.includes(item));
  return include;
}

export function buildWhereObject(whereQuery = {}, avaibleWheres = []) {
  return Object.fromEntries(
    Object.entries(whereQuery).filter(
      ([key, value]) => avaibleWheres.includes(key) && value !== undefined,
    ),
  );
}

export async function getOrder(orderQuery = '', Model) {
  const ordersArr = [];
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
      }
    });
    return ordersArr;
  } catch (error) {
    return orderQuery;
  }
}
