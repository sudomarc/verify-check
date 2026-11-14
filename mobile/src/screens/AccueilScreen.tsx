/**
 * Écran de contexte de pointage (accueil) — données réelles de l'API :
 * classes + cours du jour (Conakry) avec statut actif. L'agent choisit le
 * contexte avant de scanner ; jamais de sélection arbitraire.
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
import { getContexte, type Contexte } from "../services/api";
import { theme } from "../theme";

export type Selection = {
  classeId: string;
  classeNom: string;
  coursId: string;
  coursNom: string;
  salle?: string;
};

export function AccueilScreen({
  onSelection,
  onLogout,
  email,
}: {
  onSelection: (s: Selection) => void;
  onLogout: () => void;
  email: string;
}) {
  const [ctx, setCtx] = useState<Contexte | null>(null);
  const [erreur, setErreur] = useState<"session" | "reseau" | "serveur" | null>(null);
  const [loading, setLoading] = useState(true);
  const [classeId, setClasseId] = useState<string | null>(null);
  const [coursId, setCoursId] = useState<string | null>(null);
  const [salle, setSalle] = useState("");

  const charger = useCallback(async () => {
    setLoading(true);
    setErreur(null);
    const res = await getContexte();
    setLoading(false);
    if (!res.ok) {
      setErreur(res.error);
      return;
    }
    setCtx(res.data);
    if (!classeId && res.data.classes.length > 0) setClasseId(res.data.classes[0].id);
  }, [classeId]);

  useEffect(() => {
    charger();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading && !ctx) {
    return <Etat racine loading text="Chargement du contexte réel…" />;
  }
  if (erreur === "session") return <Etat racine erreur="Session expirée — reconnecte-toi." onAction={onLogout} action="Se reconnecter" />;
  if (erreur === "reseau") return <Etat racine erreur="Réseau indisponible." onAction={charger} action="Réessayer" />;
  if (erreur === "serveur" || !ctx) return <Etat racine erreur="Erreur serveur." onAction={charger} action="Réessayer" />;

  const classesActives = ctx.classes;
  const coursActifs = ctx.cours.filter((c) => c.actif && c.classe_id === classeId);
  const classe = classesActives.find((c) => c.id === classeId);
  const cours = coursActifs.find((c) => c.id === coursId);

  const ready = classeId && coursId;

  return (
    <ScrollView
      style={s.root}
      contentContainerStyle={s.content}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={charger} tintColor={theme.accent} />
      }
    >
      <Text style={s.titre}>Contexte de pointage</Text>
      <Text style={s.meta}>
        {ctx.jour} · {ctx.heure} (Conakry) · {email}
      </Text>

      <Text style={s.label}>Classe</Text>
      {classesActives.length === 0 ? (
        <Text style={s.hint}>Aucune classe enregistrée. La direction doit créer les classes.</Text>
      ) : (
        <View style={s.groupe}>
          {classesActives.map((c) => (
            <Pill key={c.id} label={c.nom} actif={c.id === classeId} onPress={() => { setClasseId(c.id); setCoursId(null); }} />
          ))}
        </View>
      )}

      <Text style={s.label}>Cours du moment (actifs à l'heure de Conakry)</Text>
      {coursActifs.length === 0 ? (
        <Text style={s.hint}>Aucun cours actif pour cette classe maintenant : la direction doit mettre à jour le planning.</Text>
      ) : (
        <View style={s.groupe}>
          {coursActifs.map((c) => (
            <Pill
              key={c.id}
              label={`${c.nom} · ${c.heure_debut.slice(0, 5)}–${c.heure_fin.slice(0, 5)}${c.salle ? " · " + c.salle : ""}`}
              actif={c.id === coursId}
              onPress={() => setCoursId(c.id)}
            />
          ))}
        </View>
      )}

      <Text style={s.label}>Salle du portique (facultatif)</Text>
      <TextInput
        style={s.input}
        placeholder="ex. B12"
        value={salle}
        onChangeText={setSalle}
        autoCapitalize="characters"
      />

      <TouchableOpacity
        style={[s.bouton, !ready && s.boutonOff]}
        disabled={!ready}
        onPress={() =>
          classe &&
          cours &&
          onSelection({
            classeId: classe.id,
            classeNom: classe.nom,
            coursId: cours.id,
            coursNom: cours.nom,
            salle: salle.trim() || undefined,
          })
        }
      >
        <Text style={s.boutonTexte}>Commencer le pointage</Text>
      </TouchableOpacity>

      <TouchableOpacity style={s.deconnexion} onPress={onLogout}>
        <Text style={s.deconnexionTexte}>Se déconnecter</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function Pill({ label, actif, onPress }: { label: string; actif: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity style={[s.pill, actif && s.pillOn]} onPress={onPress}>
      <Text style={[s.pillText, actif && s.pillTextOn]}>{label}</Text>
    </TouchableOpacity>
  );
}

function Etat({
  racine,
  loading,
  text,
  erreur,
  action,
  onAction,
}: {
  racine?: boolean;
  loading?: boolean;
  text?: string;
  erreur?: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <View style={[s.root, racine && { flex: 1, justifyContent: "center", padding: theme.space.xl }]}>
      {loading ? <ActivityIndicator color={theme.accent} /> : null}
      {text ? <Text style={s.meta}>{text}</Text> : null}
      {erreur ? <Text style={s.erreur}>{erreur}</Text> : null}
      {action && onAction ? (
        <TouchableOpacity style={s.bouton} onPress={onAction}>
          <Text style={s.boutonTexte}>{action}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.paper },
  content: { padding: theme.space.lg, gap: 10 },
  titre: { fontSize: theme.type.title, fontWeight: "700", color: theme.ink },
  meta: { color: theme.inkSoft, fontSize: theme.type.small },
  label: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: theme.inkSoft,
    marginTop: 8,
  },
  hint: { color: theme.inkSoft, fontSize: theme.type.small },
  groupe: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  pill: {
    paddingHorizontal: 12,
    height: 40,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.line,
    backgroundColor: theme.white,
    justifyContent: "center",
  },
  pillOn: { borderColor: theme.accent, backgroundColor: theme.accent },
  pillText: { color: theme.ink, fontSize: theme.type.body },
  pillTextOn: { color: theme.white, fontWeight: "600" },
  input: {
    height: 44,
    borderRadius: theme.radiusSm,
    borderWidth: 1,
    borderColor: theme.line,
    backgroundColor: theme.white,
    paddingHorizontal: 12,
    color: theme.ink,
  },
  bouton: {
    height: 48,
    borderRadius: theme.radiusSm,
    backgroundColor: theme.accent,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  boutonOff: { backgroundColor: theme.line },
  boutonTexte: { color: theme.white, fontWeight: "600", fontSize: theme.type.body },
  deconnexion: { alignItems: "center", padding: 14 },
  deconnexionTexte: { color: theme.inkSoft, fontSize: theme.type.small },
  erreur: { color: theme.danger, fontSize: theme.type.small },
});
