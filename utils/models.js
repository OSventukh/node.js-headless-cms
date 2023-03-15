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
