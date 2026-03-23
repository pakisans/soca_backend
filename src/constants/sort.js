export const SORT_MAPPING = {
  'price-asc': `CASE
                  WHEN a.aktivan = 1 AND a.kolicina > 0 AND a.prodajna_cena > 0 THEN 1
                  WHEN a.aktivan = 1 AND a.kolicina > 0 THEN 2
                  ELSE 3
                END ASC,
                CAST(a.prodajna_cena AS UNSIGNED) ASC`,
  'price-desc': `CASE
                   WHEN a.aktivan = 1 AND a.kolicina > 0 AND a.prodajna_cena > 0 THEN 1
                   WHEN a.aktivan = 1 AND a.kolicina > 0 THEN 2
                   ELSE 3
                 END ASC,
                 CAST(a.prodajna_cena AS UNSIGNED) DESC`,
  'name-asc': 'a.naziv ASC',
  'name-desc': 'a.naziv DESC',
  relevance: `CASE
                WHEN a.aktivan = 1 AND a.kolicina > 0 AND a.prodajna_cena > 0 THEN 1
                WHEN a.aktivan = 1 AND a.kolicina > 0 THEN 2
                ELSE 3
              END ASC,
              a.prodajna_cena DESC`,
};
