// Status "efetivo" de um agendamento, calculado pela data/hora de término.
//
// O backend também faz essa virada sozinho (job a cada poucos minutos), mas o app
// não deve mostrar uma reserva já vencida como "Próxima" nesse intervalo — nem
// depender de o job ter rodado.
//
//  • confirmada / em andamento e o horário já acabou  → concluída
//  • pendente (o estabelecimento nunca confirmou) e o horário já passou → cancelada
//    (não chegou a acontecer)

export const UPCOMING_STATUSES = ["PENDING", "CONFIRMED", "IN_PROGRESS"];

export function effectiveStatus(appointment, now = new Date()) {
  if (!appointment) return null;

  const end = new Date(appointment.endsAt || appointment.startsAt);
  const over = !Number.isNaN(end.getTime()) && end.getTime() < now.getTime();

  if (over) {
    if (appointment.status === "CONFIRMED" || appointment.status === "IN_PROGRESS") {
      return "COMPLETED";
    }
    if (appointment.status === "PENDING") {
      return "CANCELLED";
    }
  }

  return appointment.status;
}

/** Cópia do agendamento com `status` já ajustado pela data. */
export function withEffectiveStatus(appointment, now = new Date()) {
  return { ...appointment, status: effectiveStatus(appointment, now) };
}

export function isUpcoming(appointment) {
  return UPCOMING_STATUSES.includes(appointment.status);
}
