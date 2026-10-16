const { onRequest } = require("firebase-functions/v2/https");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const admin = require("firebase-admin");
admin.initializeApp();

const db = admin.firestore();

// Executa a cada 1 minuto para verificar mensagens agendadas vencidas
exports.checkScheduledBroadcasts = onSchedule(
  "every 1 minutes",
  async (event) => {
    const now = new Date().toISOString().slice(0, 16); // Formato YYYY-MM-DDTHH:mm compatível com datetime-local

    try {
      const snapshot = await db
        .collection("broadcasts")
        .where("status", "==", "scheduled")
        .where("scheduledFor", "<=", now)
        .get();

      if (snapshot.empty) {
        console.log("Nenhuma mensagem agendada para atualizar neste ciclo.");
        return null;
      }

      const batch = db.batch();
      snapshot.docs.forEach((docSnap) => {
        const docRef = db.collection("broadcasts").doc(docSnap.id);
        batch.update(docRef, { status: "sent" });
      });

      await batch.commit();
      console.log(
        `${snapshot.size} mensagens agendadas foram atualizadas para 'sent'.`
      );
      return null;
    } catch (error) {
      console.error("Erro ao atualizar mensagens agendadas:", error);
      return null;
    }
  }
);
