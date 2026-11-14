/**
 * Écran scanner — caméra native (expo-camera), pointage réel via /api/scan.
 * Inclut la saisie manuelle du code (carte abîmée / caméra indisponible),
 * le compteur réel du cours et l'historique local des vérifications.
 * Aucun état « confirmée » sans réponse du serveur.
 */

import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { getDashboard, type DashboardData } from "../services/api";
import { enregistrerScan, historique, onFileChange, type LocalItem } from "../store/scan";
import { theme } from "../theme";
import type { Selection } from "./AccueilScreen";
import type { ScanEtat } from "../lib/scanStatus";

const LIBELLES: Record<string, { titre: string; detail: string; couleur: string }> = {
  confirmee: {
    titre: "Présence confirmée",
    detail: "Le serveur a validé le pointage.",
    couleur: theme.accent,
  },
  doublon: {
    titre: "Déjà scanné",
    detail: "Ce cours a déjà validé cette carte.",
    couleur: theme.warn,
  },
  qr_invalide: {
    titre: "Carte non reconnue",
    detail: "Aucun élève pour ce code (réponse du serveur).",
    couleur: theme.danger,
  },
  pas_de_cours: {
    titre: "Aucun cours applicable",
    detail: "Aucun cours actif pour cette classe à l'heure de Conakry.",
    couleur: theme.danger,
  },
  cours_ambigu: {
    titre: "Contexte ambigu",
    detail: "Plusieurs cours actifs — précise le cours ou la salle dans le contexte.",
    couleur: theme.warn,
  },
  salle_invalide: {
    titre: "Salle / cours incorrects",
    detail: "Le cours choisi ne correspond pas à la salle ou n'est pas actif.",
    couleur: theme.warn,
  },
  session_expiree: {
    titre: "Session expirée",
    detail: "Reconnexion nécessaire.",
    couleur: theme.danger,
  },
  erreur_serveur: {
    titre: "Erreur serveur",
    detail: "Réponse inattendue — le pointage n'est PAS confirmé. Réessaie.",
    couleur: theme.danger,
  },
  hors_ligne: {
    titre: "En attente de synchronisation",
    detail: "Réseau indisponible — le pointage reste EN ATTENTE jusqu'à confirmation du serveur.",
    couleur: theme.warn,
  },
  deja_en_attente: {
    titre: "Déjà en attente",
    detail: "Ce pointage est déjà dans la file hors ligne.",
    couleur: theme.warn,
  },
};

export function ScannerScreen({
  selection,
  onSessionExpiree,
}: {
  selection: Selection;
  onSessionExpiree: () => void;
}) {
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraErreur, setCameraErreur] = useState(false);
  const [etat, setEtat] = useState<{ kind: string; detail?: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [manuel, setManuel] = useState("");
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [locaux, setLocaux] = useState<LocalItem[]>([]);

  const rafraichir = useCallback(async () => {
    const res = await getDashboard(selection.classeId);
    if (res.ok) setDashboard(res.data);
    setLocaux(await historique());
  }, [selection.classeId]);

  useEffect(() => {
    rafraichir();
    return onFileChange(rafraichir);
  }, [rafraichir]);

  async function scanner(code: string) {
    const value = code.trim().toUpperCase();
    if (!value || busy) return;
    setBusy(true);
    const res = await enregistrerScan(value, {
      coursId: selection.coursId,
      coursNom: selection.coursNom,
      salle: selection.salle,
    });
    setBusy(false);
    afficher(res);
    if (res.kind === "session_expiree") onSessionExpiree();
    await rafraichir();
  }

  function afficher(res: ScanEtat) {
    const lib = LIBELLES[res.kind];
    const detail =
      res.kind === "confirmee" && res.eleve
        ? `${res.eleve} · ${res.cours ?? selection.coursNom}`
        : res.kind === "pas_de_cours" && res.heure
          ? `${lib?.detail ?? ""} Il est ${res.heure}.`
          : (lib?.detail ?? "");
    setEtat({ kind: res.kind, detail });
  }

  async function onScanCamera(result: { data?: string }) {
    await scanner(result.data ?? "");
  }

  // Permission caméra : états explicites (jamais un blocage muet).
  if (!permission) {
    return <Centrer><ActivityIndicator color={theme.accent} /></Centrer>;
  }
  if (!permission.granted) {
    return (
      <Centrer>
        <Text style={s.erreur}>Caméra refusée ou indisponible.</Text>
        <Text style={s.meta}>
          Autorise la caméra pour scanner les cartes, ou utilise la saisie manuelle ci-dessous.
        </Text>
        <TouchableOpacity style={s.bouton} onPress={requestPermission}>
          <Text style={s.boutonTexte}>Autoriser la caméra</Text>
        </TouchableOpacity>
        <SaisieManuelle
          manuel={manuel}
          setManuel={setManuel}
          busy={busy}
          onSubmit={() => scanner(manuel)}
        />
      </Centrer>
    );
  }

  const cours = dashboard?.cours_prevus.find((c) => c.id === selection.coursId);
  const presents = cours
    ? (dashboard?.eleves ?? []).filter((e) =>
        e.presences.some((p) => p.course_id === cours.id)
      ).length
    : 0;
  const effectif = dashboard?.effectif ?? 0;

  return (
    <View style={s.root}>
      <Text style={s.titre}>{selection.coursNom}</Text>
      <Text style={s.meta}>
        {selection.classeNom}
        {selection.salle ? " · " + selection.salle : ""}
        {cours ? ` · ${cours.heure_debut.slice(0, 5)}–${cours.heure_fin.slice(0, 5)}` : ""}
      </Text>

      <View style={s.compteur}>
        <Text style={s.compteurNum}>
          {presents}
          <Text style={s.compteurTotal}>/{effectif}</Text>
        </Text>
        <Text style={s.compteurLabel}>présents confirmés (serveur)</Text>
      </View>

      <View style={[s.resultat, { borderColor: etat ? LIBELLES[etat.kind]?.couleur ?? theme.line : theme.line }]}>
        <Text style={[s.resultatTitre, { color: etat ? LIBELLES[etat.kind]?.couleur ?? theme.ink : theme.inkSoft }]}>
          {etat ? LIBELLES[etat.kind]?.titre ?? etat.kind : "En attente d'un scan"}
        </Text>
        <Text style={s.meta}>{etat?.detail ?? "Approche la carte élève de la caméra."}</Text>
        {busy ? <ActivityIndicator color={theme.accent} style={{ marginTop: 8 }} /> : null}
      </View>

      {cameraErreur ? (
        <View style={s.cameraBloc}>
          <Text style={s.meta}>Caméra indisponible sur cet appareil.</Text>
        </View>
      ) : (
        <CameraView
          style={s.camera}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
          onBarcodeScanned={onScanCamera}
          onMountError={() => setCameraErreur(true)}
        >
          <Text style={s.cameraHint}>Place la carte QR dans le cadre</Text>
        </CameraView>
      )}

      <SaisieManuelle manuel={manuel} setManuel={setManuel} busy={busy} onSubmit={() => scanner(manuel)} />

      <View style={s.historique}>
        <Text style={s.sousTitre}>Derniers pointages (locaux)</Text>
        {locaux.length === 0 ? (
          <Text style={s.meta}>Aucun pointage enregistré sur cet appareil.</Text>
        ) : (
          locaux.slice(0, 6).map((item) => (
            <View key={item.id} style={s.historiqueLigne}>
              <Text style={s.historiqueCode}>{item.code_qr}</Text>
              <Text style={[s.historiqueEtat, { color: item.etat === "en_attente" ? theme.warn : item.etat === "rejete" ? theme.danger : theme.accent }]}>
                {item.etat === "en_attente" ? "EN ATTENTE" : item.etat === "rejete" ? "REJETÉ" : "CONFIRMÉ"}
              </Text>
            </View>
          ))
        )}
      </View>
    </View>
  );
}

function SaisieManuelle({
  manuel,
  setManuel,
  busy,
  onSubmit,
}: {
  manuel: string;
  setManuel: (v: string) => void;
  busy: boolean;
  onSubmit: () => void;
}) {
  return (
    <View style={s.manuel}>
      <TextInput
        style={s.input}
        placeholder="Saisie manuelle du code de la carte"
        autoCapitalize="characters"
        autoCorrect={false}
        value={manuel}
        onChangeText={setManuel}
        onSubmitEditing={onSubmit}
      />
      <TouchableOpacity style={s.bouton} disabled={busy || !manuel.trim()} onPress={onSubmit}>
        <Text style={s.boutonTexte}>Vérifier</Text>
      </TouchableOpacity>
    </View>
  );
}

function Centrer({ children }: { children: React.ReactNode }) {
  return (
    <View style={[s.root, { alignItems: "center", justifyContent: "center", gap: 8, padding: theme.space.lg }]}>
      {children}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.paper, padding: theme.space.lg, gap: 8 },
  titre: { fontSize: theme.type.title, fontWeight: "700", color: theme.ink },
  meta: { color: theme.inkSoft, fontSize: theme.type.small },
  compteur: { alignItems: "center", paddingVertical: 4 },
  compteurNum: { fontSize: theme.type.big, fontWeight: "700", color: theme.ink },
  compteurTotal: { fontSize: 18, color: theme.inkSoft, fontWeight: "400" },
  compteurLabel: { fontSize: 11, color: theme.inkSoft, textTransform: "uppercase", letterSpacing: 0.5 },
  resultat: {
    borderWidth: 1,
    borderLeftWidth: 4,
    borderRadius: theme.radiusSm,
    backgroundColor: theme.card,
    padding: 12,
    gap: 2,
  },
  resultatTitre: { fontWeight: "700", fontSize: theme.type.body },
  camera: {
    flex: 1,
    minHeight: 240,
    borderRadius: theme.radius,
    overflow: "hidden",
    backgroundColor: theme.scanBg,
    justifyContent: "flex-end",
    padding: theme.space.md,
  },
  cameraHint: { color: "#E8EEF4", textAlign: "center", fontSize: theme.type.small },
  cameraBloc: {
    flex: 1,
    minHeight: 200,
    borderRadius: theme.radius,
    backgroundColor: theme.scanBg,
    justifyContent: "center",
    padding: theme.space.lg,
  },
  manuel: { flexDirection: "row", gap: 8 },
  input: {
    flex: 1,
    height: 44,
    borderRadius: theme.radiusSm,
    borderWidth: 1,
    borderColor: theme.line,
    backgroundColor: theme.white,
    paddingHorizontal: 12,
    color: theme.ink,
  },
  bouton: {
    height: 44,
    paddingHorizontal: 16,
    borderRadius: theme.radiusSm,
    backgroundColor: theme.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  boutonTexte: { color: theme.white, fontWeight: "600" },
  historique: { gap: 6 },
  sousTitre: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: theme.inkSoft,
    fontWeight: "600",
  },
  historiqueLigne: { flexDirection: "row", justifyContent: "space-between" },
  historiqueCode: { fontFamily: "monospace", color: theme.ink, fontSize: theme.type.small },
  historiqueEtat: { fontSize: theme.type.small, fontWeight: "600" },
  erreur: { color: theme.danger, fontSize: theme.type.body, textAlign: "center" },
});
