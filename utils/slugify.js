import slugify from 'slugify';

export default function slugifyString(string) {
  return slugify(string, {
    lower: true,
    locale: 'uk',
  });
}
