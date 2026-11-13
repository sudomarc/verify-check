// VerifyCheck — données de démonstration du scanner.
// Miroir de src/lib/mock-data.ts (branche main) : mêmes identifiants, mêmes codes QR.
// Aucune donnée réelle. À supprimer quand l'API du Rôle 1 existe.

window.VC = window.VC || {};

VC.mockData = {
  classes: [
    { id: "11111111-1111-4111-8111-111111111101", nom: "6ème A" },
    { id: "11111111-1111-4111-8111-111111111102", nom: "5ème B" },
  ],

  students: [
    { id: "22222222-2222-4222-8222-222222222201", code_qr: "VC-6A-0001", nom: "Fatoumata Diallo", classe_id: "11111111-1111-4111-8111-111111111101" },
    { id: "22222222-2222-4222-8222-222222222202", code_qr: "VC-6A-0002", nom: "Mamadou Camara", classe_id: "11111111-1111-4111-8111-111111111101" },
    { id: "22222222-2222-4222-8222-222222222203", code_qr: "VC-6A-0003", nom: "Aïssatou Barry", classe_id: "11111111-1111-4111-8111-111111111101" },
    { id: "22222222-2222-4222-8222-222222222204", code_qr: "VC-6A-0004", nom: "Ibrahima Sow", classe_id: "11111111-1111-4111-8111-111111111101" },
    { id: "22222222-2222-4222-8222-222222222205", code_qr: "VC-5B-0001", nom: "Kadiatou Keïta", classe_id: "11111111-1111-4111-8111-111111111102" },
    { id: "22222222-2222-4222-8222-222222222206", code_qr: "VC-5B-0002", nom: "Ousmane Condé", classe_id: "11111111-1111-4111-8111-111111111102" },
    { id: "22222222-2222-4222-8222-222222222207", code_qr: "VC-5B-0003", nom: "Mariam Touré", classe_id: "11111111-1111-4111-8111-111111111102" },
    { id: "22222222-2222-4222-8222-222222222208", code_qr: "VC-5B-0004", nom: "Alpha Bah", classe_id: "11111111-1111-4111-8111-111111111102" },
  ],

  // Le "cours en cours" est décidé par le serveur dans l'app réelle.
  // Ici on expose les cours du jour pour permettre la démo.
  courses: [
    { id: "33333333-3333-4333-8333-333333333301", nom: "Mathématiques", classe_id: "11111111-1111-4111-8111-111111111101", jour_semaine: 1, heure_debut: "08:00", heure_fin: "10:00" },
    { id: "33333333-3333-4333-8333-333333333302", nom: "Français", classe_id: "11111111-1111-4111-8111-111111111101", jour_semaine: 1, heure_debut: "10:15", heure_fin: "12:15" },
    { id: "33333333-3333-4333-8333-333333333303", nom: "Sciences", classe_id: "11111111-1111-4111-8111-111111111102", jour_semaine: 2, heure_debut: "08:00", heure_fin: "10:00" },
    { id: "33333333-3333-4333-8333-333333333304", nom: "Anglais", classe_id: "11111111-1111-4111-8111-111111111102", jour_semaine: 2, heure_debut: "10:15", heure_fin: "12:15" },
  ],
};
