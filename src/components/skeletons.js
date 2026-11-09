import { View } from "react-native";
import Skeleton, { SkeletonGroup } from "./Skeleton";
import { shadow } from "../theme";

/**
 * Skeletons prontos de cada tela do app do cliente. Cada um imita o layout
 * real (mesmos paddings, bordas e tamanhos) pra não "pular" quando os dados
 * chegam.
 */

const range = (n) => Array.from({ length: n }, (_, i) => i);

// ---------------- HOME ----------------
// Cartão "Seu próximo horário" (fica dentro do cabeçalho dourado)
export function NextAppointmentSkeleton() {
  return (
    <View
      className="mx-5 mt-5 flex-row items-center rounded-2xl bg-white px-4 py-3"
      style={shadow.card}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel="Carregando seu próximo horário"
    >
      <Skeleton width={48} height={48} radius={12} />
      <View className="ml-3 flex-1">
        <Skeleton width={110} height={9} />
        <Skeleton width="80%" height={13} style={{ marginTop: 7 }} />
        <Skeleton width="50%" height={10} style={{ marginTop: 6 }} />
      </View>
    </View>
  );
}

// Fileira horizontal de cards de estabelecimento ("Perto de você")
export function BusinessCardRowSkeleton({ count = 3 }) {
  return (
    <SkeletonGroup
      label="Carregando estabelecimentos"
      className="flex-row"
      style={{ paddingHorizontal: 20, overflow: "hidden" }}
    >
      {range(count).map((i) => (
        <View key={i} className="mr-4 w-56 rounded-2xl" style={shadow.card}>
          <View className="overflow-hidden rounded-2xl bg-white">
            <Skeleton height={128} radius={0} />
            <View className="px-3 py-2.5">
              <Skeleton width="70%" height={13} />
              <Skeleton width="85%" height={10} style={{ marginTop: 6 }} />
              <Skeleton width={56} height={16} radius={999} style={{ marginTop: 8 }} />
            </View>
          </View>
        </View>
      ))}
    </SkeletonGroup>
  );
}

// ---------------- BUSCA ----------------
export function ResultListSkeleton({ count = 3 }) {
  return (
    <SkeletonGroup label="Carregando resultados" style={{ paddingHorizontal: 24 }}>
      {range(count).map((i) => (
        <View key={i} className="mb-5 rounded-2xl" style={shadow.card}>
          <View className="overflow-hidden rounded-2xl bg-white">
            <Skeleton height={150} radius={0} />
            <View className="px-3.5 py-3">
              <Skeleton width={i % 2 ? "50%" : "65%"} height={13} />
              <Skeleton width="80%" height={10} style={{ marginTop: 7 }} />
              <View className="mt-2.5 flex-row" style={{ gap: 6 }}>
                <Skeleton width={52} height={16} radius={999} />
                <Skeleton width={72} height={16} radius={999} />
              </View>
            </View>
          </View>
        </View>
      ))}
    </SkeletonGroup>
  );
}

// ---------------- AGENDAMENTOS ----------------
export function AppointmentListSkeleton({ count = 3 }) {
  return (
    <SkeletonGroup label="Carregando agendamentos">
      <Skeleton width={70} height={12} style={{ marginBottom: 12 }} />
      {range(count).map((i) => (
        <View key={i} className="mb-4 rounded-2xl bg-[#f3f3f3] p-4">
          <View className="flex-row items-start justify-between">
            <View className="flex-1 pr-3">
              <Skeleton width={70} height={18} radius={999} style={{ backgroundColor: "#E2E2E2" }} />
              <Skeleton width="70%" height={15} style={{ marginTop: 10, backgroundColor: "#E2E2E2" }} />
              <Skeleton width="45%" height={10} style={{ marginTop: 7, backgroundColor: "#E2E2E2" }} />
              <Skeleton width="55%" height={10} style={{ marginTop: 10, backgroundColor: "#E2E2E2" }} />
              <View className="mt-3 flex-row" style={{ gap: 8 }}>
                <Skeleton width={130} height={34} radius={8} style={{ backgroundColor: "#E2E2E2" }} />
                <Skeleton width={70} height={34} radius={8} style={{ backgroundColor: "#E2E2E2" }} />
              </View>
            </View>
            <View className="items-end">
              <Skeleton width={44} height={10} style={{ backgroundColor: "#E2E2E2" }} />
              <Skeleton width={28} height={24} radius={6} style={{ marginTop: 6, backgroundColor: "#E2E2E2" }} />
              <Skeleton width={36} height={10} style={{ marginTop: 6, backgroundColor: "#E2E2E2" }} />
            </View>
          </View>
        </View>
      ))}
    </SkeletonGroup>
  );
}

// ---------------- ESTABELECIMENTO ----------------
export function ServiceRowsSkeleton({ count = 4 }) {
  return (
    <View>
      {range(count).map((i) => (
        <View
          key={i}
          className="flex-row items-start justify-between border-b border-neutral-100 py-3"
        >
          <View className="flex-1 pr-3">
            <Skeleton width={i % 2 ? "55%" : "70%"} height={13} />
            <Skeleton width="45%" height={10} style={{ marginTop: 7 }} />
          </View>
          <View className="items-end">
            <Skeleton width={64} height={13} />
            <Skeleton width={28} height={10} style={{ marginTop: 6, marginBottom: 8 }} />
            <Skeleton width={80} height={30} radius={8} />
          </View>
        </View>
      ))}
    </View>
  );
}

export function BusinessDetailSkeleton() {
  return (
    <SkeletonGroup label="Carregando estabelecimento">
      <Skeleton height={260} radius={0} />
      <View className="mt-3 flex-row px-5" style={{ gap: 8 }}>
        {range(4).map((i) => (
          <Skeleton key={i} height={56} radius={12} style={{ flex: 1 }} />
        ))}
      </View>
      <View className="mt-4 px-5">
        <Skeleton width="65%" height={24} />
        <Skeleton width={180} height={14} style={{ marginTop: 10 }} />
        <Skeleton width="80%" height={12} style={{ marginTop: 10 }} />
        <Skeleton width={90} height={10} style={{ marginTop: 8 }} />
      </View>
      <View className="mt-5 flex-row border-b border-neutral-100 px-5 pb-3" style={{ gap: 24 }}>
        {[64, 78, 72, 120].map((w, i) => (
          <Skeleton key={i} width={w} height={11} />
        ))}
      </View>
      <View className="mt-4 px-5 pb-8">
        <Skeleton height={44} radius={12} style={{ marginBottom: 16 }} />
        <View className="mb-5 flex-row" style={{ gap: 8 }}>
          <Skeleton width={140} height={32} radius={999} />
          <Skeleton width={120} height={32} radius={999} />
        </View>
        <Skeleton width={160} height={17} style={{ marginBottom: 8 }} />
        <ServiceRowsSkeleton />
      </View>
    </SkeletonGroup>
  );
}

// Lista em sanfona da tela "Adicionar serviço"
export function ServiceCategoriesSkeleton({ count = 4 }) {
  return (
    <SkeletonGroup label="Carregando serviços">
      {range(count).map((i) => (
        <View
          key={i}
          className="mb-3 flex-row items-center justify-between rounded-xl bg-neutral-100 px-4 py-3"
        >
          <Skeleton width={i % 2 ? 110 : 150} height={13} style={{ backgroundColor: "#E2E2E2" }} />
          <Skeleton width={16} height={16} radius={4} style={{ backgroundColor: "#E2E2E2" }} />
        </View>
      ))}
    </SkeletonGroup>
  );
}

// ---------------- DETALHES ----------------
export function DetailsSkeleton() {
  return (
    <SkeletonGroup label="Carregando detalhes">
      <View>
        <Skeleton height={160} radius={0} />
        <View
          className="absolute -bottom-10 left-4 right-4 flex-row items-center rounded-2xl border border-neutral-100 bg-white p-4"
        >
          <Skeleton circle width={36} style={{ marginRight: 12 }} />
          <View className="flex-1">
            <Skeleton width="60%" height={13} />
            <Skeleton width="85%" height={10} style={{ marginTop: 6 }} />
          </View>
        </View>
      </View>
      <View className="px-5" style={{ marginTop: 56 }}>
        <Skeleton width={120} height={15} />
        <View className="mt-4 flex-row flex-wrap" style={{ gap: 20 }}>
          {range(3).map((i) => (
            <View key={i} className="items-center">
              <Skeleton circle width={56} />
              <Skeleton width={50} height={10} style={{ marginTop: 6 }} />
            </View>
          ))}
        </View>
        <Skeleton width={150} height={15} style={{ marginTop: 28 }} />
        <Skeleton height={48} radius={12} style={{ marginTop: 12 }} />
        <Skeleton width={170} height={15} style={{ marginTop: 28, marginBottom: 6 }} />
        {range(7).map((i) => (
          <View key={i} className="flex-row justify-between border-b border-neutral-100 py-2.5">
            <Skeleton width={100} height={11} />
            <Skeleton width={80} height={11} />
          </View>
        ))}
      </View>
    </SkeletonGroup>
  );
}

// ---------------- CARTÕES-PRESENTE ----------------
export function GiftCardListSkeleton({ count = 2 }) {
  return (
    <SkeletonGroup label="Carregando cartões-presente">
      {range(count).map((i) => (
        <View key={i} className="mx-5 mb-4">
          <Skeleton height={200} radius={16} />
        </View>
      ))}
    </SkeletonGroup>
  );
}

// ---------------- PROFISSIONAIS ----------------
export function EmployeeListSkeleton({ count = 4 }) {
  return (
    <SkeletonGroup label="Carregando profissionais">
      {range(count + 1).map((i) => (
        <View key={i} className="flex-row items-center border-b border-neutral-100 py-4">
          <Skeleton circle width={48} />
          <View className="ml-4 flex-1">
            <Skeleton width={i === 0 ? "60%" : i % 2 ? "40%" : "55%"} height={15} />
            {i > 0 ? <Skeleton width="35%" height={10} style={{ marginTop: 7 }} /> : null}
          </View>
          <Skeleton width={12} height={18} radius={4} />
        </View>
      ))}
    </SkeletonGroup>
  );
}

// ---------------- AVALIAÇÕES ----------------
export function ReviewsSkeleton({ count = 3 }) {
  return (
    <SkeletonGroup label="Carregando avaliações">
      <View className="mx-5 mt-5 rounded-2xl bg-white p-5">
        <View className="flex-row items-center">
          <View className="mr-5 items-center">
            <Skeleton width={70} height={44} radius={10} />
            <Skeleton width={90} height={14} style={{ marginTop: 8 }} />
            <Skeleton width={70} height={10} style={{ marginTop: 6 }} />
          </View>
          <View className="flex-1">
            {range(5).map((i) => (
              <View key={i} className="mb-2 flex-row items-center">
                <Skeleton width={10} height={10} radius={3} style={{ marginRight: 8 }} />
                <Skeleton height={6} radius={999} style={{ flex: 1 }} />
              </View>
            ))}
          </View>
        </View>
      </View>

      <Skeleton width={130} height={15} style={{ marginTop: 20, marginLeft: 20, marginBottom: 12 }} />
      <View className="flex-row px-5" style={{ gap: 8 }}>
        {range(4).map((i) => (
          <Skeleton key={i} width={80} height={80} radius={12} />
        ))}
      </View>

      <View className="mt-6">
        {range(count).map((i) => (
          <View key={i} className="mx-5 mb-3 rounded-2xl bg-white p-4">
            <View className="flex-row items-center">
              <Skeleton circle width={40} style={{ marginRight: 12 }} />
              <View className="flex-1">
                <Skeleton width="45%" height={13} />
                <Skeleton width="30%" height={9} style={{ marginTop: 6 }} />
              </View>
            </View>
            <Skeleton width={90} height={12} style={{ marginTop: 14 }} />
            <Skeleton width="95%" height={11} style={{ marginTop: 10 }} />
            <Skeleton width="70%" height={11} style={{ marginTop: 6 }} />
          </View>
        ))}
      </View>
    </SkeletonGroup>
  );
}

// ---------------- CONFIGURAÇÕES ----------------
function SettingsRowSkeleton({ twoLines = true }) {
  return (
    <View className="flex-row items-center border-b border-line px-4 py-3.5">
      <Skeleton width={18} height={18} radius={5} style={{ backgroundColor: "#E2E2E2" }} />
      <View className="ml-3 flex-1">
        <Skeleton width={90} height={12} style={{ backgroundColor: "#E2E2E2" }} />
        {twoLines ? (
          <Skeleton width="60%" height={10} style={{ marginTop: 6, backgroundColor: "#E2E2E2" }} />
        ) : null}
      </View>
    </View>
  );
}

export function SettingsSkeleton() {
  return (
    <SkeletonGroup label="Carregando configurações" style={{ paddingHorizontal: 20 }}>
      <Skeleton width={60} height={10} style={{ marginTop: 24, marginBottom: 8, marginLeft: 4 }} />
      <View className="overflow-hidden rounded-2xl bg-surface-alt">
        <SettingsRowSkeleton />
        <SettingsRowSkeleton />
        <SettingsRowSkeleton />
      </View>
      <Skeleton width={80} height={10} style={{ marginTop: 24, marginBottom: 8, marginLeft: 4 }} />
      <Skeleton height={52} radius={16} />
      <Skeleton width={100} height={10} style={{ marginTop: 24, marginBottom: 8, marginLeft: 4 }} />
      <View className="overflow-hidden rounded-2xl bg-surface-alt">
        <SettingsRowSkeleton />
      </View>
    </SkeletonGroup>
  );
}

// ---------------- AGENDAR: HORÁRIOS ----------------
export function TimeSlotsSkeleton({ count = 6 }) {
  return (
    <SkeletonGroup
      label="Carregando horários"
      className="mt-2 flex-row px-5"
      style={{ overflow: "hidden" }}
    >
      {range(count).map((i) => (
        <Skeleton key={i} width={72} height={48} radius={12} style={{ marginRight: 12 }} />
      ))}
    </SkeletonGroup>
  );
}

// ---------------- GENÉRICO ----------------
// Usado pelo LoadingScreen quando não há um skeleton específico.
export function PageSkeleton() {
  return (
    <SkeletonGroup label="Carregando" style={{ paddingHorizontal: 20, paddingTop: 56 }}>
      <Skeleton width="55%" height={24} />
      <Skeleton width="35%" height={12} style={{ marginTop: 10, marginBottom: 24 }} />
      {range(4).map((i) => (
        <View key={i} className="mb-4 flex-row items-center rounded-2xl bg-white p-4" style={shadow.card}>
          <Skeleton circle width={44} />
          <View className="ml-3 flex-1">
            <Skeleton width={i % 2 ? "50%" : "65%"} height={13} />
            <Skeleton width="40%" height={10} style={{ marginTop: 7 }} />
          </View>
        </View>
      ))}
    </SkeletonGroup>
  );
}
