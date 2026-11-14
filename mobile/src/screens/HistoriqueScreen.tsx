/**
 * Écran historique mobile — pointages locaux de l'appareil avec états
 * explicites (EN ATTENTE / CONFIRMÉ / REJETÉ) et données serveur réelles
 * (compteurs par cours du jour). Aucune donnée inventée.
 */

import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { getDashboard, type DashboardData } from "../services/api";
import { historique, onFileChange, synchroniserFile, type LocalItem } from "../store/scan";
import { theme } from "../theme";

const ETAT_LIBELLE: Record<LocalItem["etat"], string> = {
  en_attente: "EN ATTENTE",
  confirme: "CONFIRMÉ",
  rejete: "REJETÉ",
};
const ETAT_COULEUR: Record<LocalItem["etat"], string> = {
  en_attente: theme.warn,
  confirme: theme.accent,
  rejete: theme.danger,
};

export function HistoriqueScreen({ classeId, onSessionExpiree }: { classeId: string; onSessionExpiree: () => void }) {
  const [locaux, setLocaux] = useState<LocalItem[]>([]);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [erreur, setErreur] = useState<"session" | "reseau" | "serveur" | null>(null);
  const [loading, setLoading] = useState(true);
  const [sync, setSync] = useState<number | null>(null);

  const charger = useCallback(async () => {
    setLoading(true);
    setErreur(null);
    setLocaux(await historique());
    const res = await getDashboard(classeId);
    setLoading(false);
    if (!res.ok) {
      setErreur(res.error);
      if (res.error === "session") onSessionExpiree();
      return;
    }
    setDashboard(res.data);
  }, [classeId, onSessionExpiree]);

  useEffect(() => {
    charger();
    return onFileChange(charger);
  }, [charger]);

  async function syncManuelle() {
    const n = await synchroniserFile();
    setSync(n);
  }

  const enAttente = locaux.filter((i) => i.etat === "en_attente").length;

  return (
    <View style={s.root}>
      <View style={s.entete}>
        <Text style={s.titre}>Historique</Text>
        {enAttente > 0 ? (
          <TouchableOpacity style={s.sync} onPress={syncManuelle}>
            <Text style={s.syncTexte}>Synchroniser ({enAttente} en attente)</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      {sync !== null ? (
        <Text style={s.meta}>{sync > 0 ? `${sync} pointage(s) confirmé(s) par le serveur.` : "Rien à synchroniser ou réseau indisponible."}</Text>
      ) : null}

      {erreur && !dashboard ? (
        <Text style={s.erreur}>
          {erreur === "reseau" ? "Réseau indisponible — l'historique local reste affiché." : "Erreur serveur."}
        </Text>
      ) : null}

      {dashboard ? (
        <View style={s.cours}>
          {dashboard.cours_prevus.map((c) => {
            const presents = dashboard.eleves.filter((e) => e.presences.some((p) => p.course_id === c.id)).length;
            return (
              <View key={c.id} style={s.coursLigne}>
                <Text style={s.coursNom}>{c.nom}</Text>
                <Text style={s.coursCompte}>
                  {presents}/{dashboard.effectif} présents
                </Text>
              </View>
            );
          })}
          {dashboard.cours_prevus.length === 0 ? (
            <Text style={s.meta}>Aucun cours prévu aujourd'hui.</Text>
          ) : null}
        </View>
      ) : null}

      {loading && locaux.length === 0 ? <ActivityIndicator color={theme.accent} /> : null}

      <FlatList
        data={locaux}
        keyExtractor={(i) => i.id}
        ListEmptyComponent={<Text style={s.meta}>Aucun pointage sur cet appareil.</Text>}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={charger} tintColor={theme.accent} />}
        renderItem={({ item }) => (
          <View style={s.ligne}>
            <View>
              <Text style={s.code}>{item.code_qr}</Text>
              <Text style={s.meta}>{new Date(item.at).toLocaleString()}</Text>
              {item.note ? <Text style={s.meta}>{item.note}</Text> : null}
            </View>
            <Text style={[s.etat, { color: ETAT_COULEUR[item.etat] }]}>{ETAT_LIBELLE[item.etat]}</Text>
          </View>
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.paper, padding: theme.space.lg, gap: 10 },
  entete: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  titre: { fontSize: theme.type.title, fontWeight: "700", color: theme.ink },
  sync: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.accent,
    paddingHorizontal: 12,
    height: 32,
    justifyContent: "center",
  },
  syncTexte: { color: theme.accent, fontWeight: "600", fontSize: theme.type.small },
  meta: { color: theme.inkSoft, fontSize: theme.type.small },
  erreur: { color: theme.danger, fontSize: theme.type.small },
  cours: { gap: 4 },
  coursLigne: { flexDirection: "row", justifyContent: "space-between" },
  coursNom: { color: theme.ink, fontSize: theme.type.body },
  coursCompte: { color: theme.inkSoft, fontSize: theme.type.small },
  ligne: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: theme.card,
    borderRadius: theme.radiusSm,
    borderWidth: 1,
    borderColor: theme.line,
    padding: 10,
    marginBottom: 6,
  },
  code: { fontFamily: "monospace", color: theme.ink, fontSize: theme.type.body },
  etat: { fontWeight: "700", fontSize: 12 },
});
