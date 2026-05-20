import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";

interface Trip {
  id: string;
  title: string;
  description?: string;
  destination?: string;
  coverImage?: string;
  startDate?: string;
  endDate?: string;
  lat?: number;
  lng?: number;
  cityId?: string;
  shareToken?: string;
  isPublic: boolean;
  items?: ItineraryItem[];
  documents?: any[];
  createdAt: string;
  updatedAt: string;
}

interface ItineraryItem {
  id: string;
  tripId: string;
  dayNumber: number;
  type: string;
  title: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  locationName?: string;
  address?: string;
  lat?: number;
  lng?: number;
  bookingRef?: string;
  notes?: string;
  orderIndex: number;
  documents?: any[];
}

export function useTrips() {
  return useQuery({
    queryKey: ["trips"],
    queryFn: () => apiRequest<{ trips: Trip[] }>("/api/trips"),
  });
}

export function useTrip(id: string) {
  return useQuery({
    queryKey: ["trips", id],
    queryFn: () => apiRequest<{ trip: Trip }>(`/api/trips/${id}`),
    enabled: !!id,
  });
}

export function useCreateTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Trip>) =>
      apiRequest("/api/trips", { method: "POST", body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
    },
  });
}

export function useUpdateTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Trip> & { id: string }) =>
      apiRequest(`/api/trips/${id}`, { method: "PUT", body: data }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      queryClient.invalidateQueries({ queryKey: ["trips", variables.id] });
    },
  });
}

export function useDeleteTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiRequest(`/api/trips/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
    },
  });
}

export function useItineraryItems(tripId: string) {
  return useQuery({
    queryKey: ["trips", tripId, "items"],
    queryFn: () =>
      apiRequest<{ items: ItineraryItem[] }>(
        `/api/trips/${tripId}/items`
      ),
    enabled: !!tripId,
  });
}

export function useAddItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      tripId,
      ...data
    }: Partial<ItineraryItem> & { tripId: string }) =>
      apiRequest(`/api/trips/${tripId}/items`, {
        method: "POST",
        body: data,
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["trips", variables.tripId, "items"],
      });
      queryClient.invalidateQueries({ queryKey: ["trips", variables.tripId] });
    },
  });
}

export function useUpdateItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      tripId,
      id,
      ...data
    }: Partial<ItineraryItem> & { tripId: string; id: string }) =>
      apiRequest(`/api/trips/${tripId}/items/${id}`, {
        method: "PUT",
        body: data,
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["trips", variables.tripId, "items"],
      });
    },
  });
}

export function useDeleteItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ tripId, id }: { tripId: string; id: string }) =>
      apiRequest(`/api/trips/${tripId}/items/${id}`, {
        method: "DELETE",
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["trips", variables.tripId, "items"],
      });
    },
  });
}
