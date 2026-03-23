export function buildImageUrl(article) {
  if (typeof article.slika === 'string' && article.slika.includes('.jpg')) {
    const imageName = article.slika.substring(
      0,
      article.slika.indexOf('.jpg') + 4,
    );
    return `/images/slikepvp/${imageName}`;
  }
  const cleanedName = article.naziv.replace(/[^a-zA-Z0-9]/g, '_');
  return `/images/slikepvp/${article.slika}_${cleanedName}.jpg`;
}

export function withImageUrl(article) {
  return { ...article, imageUrl: buildImageUrl(article) };
}
