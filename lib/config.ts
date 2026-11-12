// ---------------------------------------------------------------
// Paramètres de la traversée — modifie tout ici, sans toucher au reste.
// ---------------------------------------------------------------
export const config = {
  // Arrivée : minuit du Nouvel An, heure de Dakar (UTC+0).
  targetDate: "2027-01-01T00:00:00+00:00",

  // Décollage symbolique : position de l'avion au départ de 2026.
  // L'avion progresse entre cette date et targetDate.
  journeyStart: "2026-12-01T00:00:00+00:00",

  fromYear: "2026",
  toYear: "2027",

  eyebrow: "Le grand envol",
  tagline: "D'un ciel à l'autre, nous prenons notre envol vers l'année nouvelle.",
  place: "Perez Chapel — Dakar",
  verseBefore: "« Ils prennent leur envol comme les aigles. » — Ésaïe 40:31",

  arrivedTitle: "Nous avons atterri",
  arrivedSubtitle: "Bonne et heureuse année 2027 ✦",

  // -------------------------------------------------------------
  // Écran de célébration (affiché à la fin du décompte)
  // -------------------------------------------------------------
  celebration: {
    eyebrow: "✦ Nouvelle année ✦",
    brand: "Perez Chapel Dakar",
    wish: "vous souhaite une belle et heureuse année",
    year: "2027",
    verse: "« Voici, je fais toutes choses nouvelles. » — Apocalypse 21:5",
  },

  // Libellés du mode aperçu (pour visualiser l'arrivée avant la fin).
  previewEnter: "Aperçu de l'arrivée ✦",
  previewExit: "← Revenir au décompte",

  // -------------------------------------------------------------
  // Ticket d'embarquement (téléchargement, sans backend)
  // -------------------------------------------------------------
  ticket: {
    label: "Télécharger votre ticket d'embarquement",
    note: "PDF à conserver, imprimer ou ajouter à votre portefeuille.",

    // PDF servi en statique depuis /public — fonctionne tout de suite.
    pdfUrl: "/billet_embarquement_perez_chapel.pdf",
    fileName: "Billet-embarquement-Perez-Chapel-Dakar.pdf",

    // Apple Wallet / Google Wallet :
    // un PDF ne peut PAS être ajouté à Wallet. Il faut un pass signé.
    //  - Apple  : un fichier .pkpass signé (certificat Pass Type ID), placé
    //             dans /public, puis mettre son URL ci-dessous (ex: "/pass.pkpass").
    //  - Google : un lien "Save to Google Wallet" (JWT signé par la clé éditeur).
    // Tant que ces valeurs restent null, les boutons correspondants sont masqués.
    appleWalletUrl: null as string | null,
    googleWalletUrl: null as string | null,
  },
};
