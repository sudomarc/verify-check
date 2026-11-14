/**
 * Racine de l'app mobile VerifyCheck.
 * - gate de session : Login ↔ onglets (Accueil / Scanner / Historique) ;
 * - la navigation est volontairement simple (état local, pas de dépendance
 *   de navigation) : un seul flux admin, 3 écrans.
 */

import { useCallback, useEffect, useState } from "react";
import { SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LoginScreen } from "./src/screens/LoginScreen";
import { AccueilScreen, type Selection } from "./src/screens/AccueilScreen";
import { ScannerScreen } from "./src/screens/ScannerScreen";
import { HistoriqueScreen } from "./src/screens/HistoriqueScreen";
import { logout, session } from "./src/services/auth";
import { theme } from "./src/theme";

type Onglet = "accueil" | "scanner" | "historique";

export default function App() {
  const [email, setEmail] = useState<string | null>(null);
  const [chargement, setChargement] = useState(true);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [onglet, setOnglet] = useState<Onglet>("accueil");

  useEffect(() => {
    session().then((s) => {
      setEmail(s?.user.email ?? null);
      setChargement(false);
    });
  }, []);

  const deconnexion = useCallback(async () => {
    await logout();
    setEmail(null);
    setSelection(null);
    setOnglet("accueil");
  }, []);

  if (chargement) return <View style={s.paper} />;

  if (!email) {
    return <LoginScreen onConnecte={setEmail} />;
  }

  return (
    <SafeAreaView style={s.paper}>
      <StatusBar barStyle="dark-content" />
      {selection ? (
        <>
          <View style={s.contenu}>
            {onglet === "accueil" ? (
              <AccueilScreen email={email} onSelection={setSelection} onLogout={deconnexion} />
            ) : null}
            {onglet === "scanner" ? (
              <ScannerScreen
                selection={selection}
                onSessionExpiree={deconnexion}
              />
            ) : null}
            {onglet === "historique" ? (
              <HistoriqueScreen classeId={selection.classeId} onSessionExpiree={deconnexion} />
            ) : null}
          </View>
          <View style={s.tabs}>
            {(
              [
                ["accueil", "Contexte"],
                ["scanner", "Scanner"],
                ["historique", "Historique"],
              ] as Array<[Onglet, string]>
            ).map(([id, label]) => (
              <TouchableOpacity
                key={id}
                style={[s.tab, onglet === id && s.tabOn]}
                onPress={() => setOnglet(id)}
                accessibilityLabel={label}
              >
                <Text style={[s.tabTexte, onglet === id && s.tabTexteOn]}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      ) : (
        <AccueilScreen email={email} onSelection={setSelection} onLogout={deconnexion} />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  paper: { flex: 1, backgroundColor: theme.paper },
  contenu: { flex: 1 },
  tabs: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: theme.line,
    backgroundColor: theme.card,
  },
  tab: { flex: 1, height: 52, alignItems: "center", justifyContent: "center" },
  tabOn: { borderTopWidth: 2, borderTopColor: theme.accent },
  tabTexte: { color: theme.inkSoft, fontSize: 13, fontWeight: "600" },
  tabTexteOn: { color: theme.accentInk },
});
