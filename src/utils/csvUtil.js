import { createObjectCsvStringifier } from 'csv-writer';

export const generateCsv = (artikalPodaci, ukupnaCena) => {
  const csvStringifier = createObjectCsvStringifier({
    header: [
      { id: 'name', title: 'Naziv' },
      { id: 'sifra', title: 'Šifra' },
      { id: 'price', title: 'Cena' },
      { id: 'kolicina', title: 'Količina' },
    ],
  });

  const records = artikalPodaci.map((item) => ({
    name: item.name,
    sifra: item.sifra,
    price: `${item.price} RSD`,
    kolicina: item.kolicina,
  }));

  const csvContent =
    csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(records);

  const totalCsvStringifier = createObjectCsvStringifier({
    header: [
      { id: 'label', title: '' },
      { id: 'value', title: '' },
    ],
  });

  const totalRecord = [
    {
      label: 'Ukupna cena',
      value: `${ukupnaCena} RSD`,
    },
  ];

  return csvContent + '\n' + totalCsvStringifier.stringifyRecords(totalRecord);
};
