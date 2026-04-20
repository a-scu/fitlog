import { Set, Rest } from "@/screens/ExerciseScreen/types";
import { Exercise } from "@/types/Exercise";
import { create } from "zustand";
import { randomId } from "@/utils/random";

interface RoutineDraftStore {
    exercise: Exercise | null;
    steps: (Set | Rest)[];
    setExercise: (exercise: Exercise | null) => void;
    setSteps: (stepsOrUpdater: (Set | Rest)[] | ((prev: (Set | Rest)[]) => (Set | Rest)[])) => void;
    clearDraft: () => void;

    // Acciones de Sets
    addSet: (exerciseId: string, setConfig?: { weight?: string; reps?: string; rir?: string }) => void;
    addRest: () => void;
    updateRestDuration: (id: string, duration: number) => void;
    deleteStep: (id: string) => void;
    updateSetField: (setId: string, field: string, value: any) => void;
    
    // Acciones de DropSets
    toggleDropSets: (setId: string) => void;
    addDropSet: (setId: string) => void;
    deleteDropSet: (setId: string, dropSetId: string) => void;
    updateDropSetField: (setId: string, dropSetId: string, field: string, value: any) => void;
    
    // Acciones de PartialReps
    updateDropSetPartialRepsField: (setId: string, dropSetId: string, field: string, value: any) => void;
    deletePartialReps: (setId: string, dropSetId?: string) => void;
    updatePartialRepsField: (setId: string, field: string, value: any) => void;
    
    // Acciones de Notes
    toggleNotes: (setId: string) => void;
    updateNotes: (setId: string, note: string) => void;
}

export const useRoutineDraftStore = create<RoutineDraftStore>((set) => ({
    exercise: null,
    steps: [],

    setExercise: (exercise) => set({ exercise }),
    setSteps: (stepsOrUpdater) => set((state) => ({
        steps: typeof stepsOrUpdater === 'function' ? stepsOrUpdater(state.steps) : stepsOrUpdater
    })),
    clearDraft: () => set({ exercise: null, steps: [] }),

    addSet: (exerciseId, { weight, reps, rir } = {}) => set((state) => {
        const newId = randomId();
        const lastSet = [...state.steps].reverse().find(s => s.type !== "rest") as Set | undefined;
        return {
            steps: [
                ...state.steps,
                {
                    id: newId,
                    weight: weight ?? lastSet?.weight ?? "",
                    reps: reps ?? lastSet?.reps ?? "10",
                    rir: rir ?? lastSet?.rir ?? "0",
                    exerciseId: exerciseId,
                    type: lastSet?.type ?? "effective",
                    weightIsRange: false,
                    repsIsRange: false,
                    rirIsRange: false,
                    dropSets: [],
                    partialReps: { count: "", rom: "", customRom: "" },
                    notes: { enabled: false, text: "" },
                }
            ]
        };
    }),

    addRest: () => set((state) => ({
        steps: [...state.steps, { id: randomId(), type: "rest", duration: 60 }]
    })),

    updateRestDuration: (id, duration) => set((state) => ({
        steps: state.steps.map(s => s.id === id && s.type === "rest" ? { ...s, duration } : s)
    })),

    deleteStep: (id) => set((state) => ({
        steps: state.steps.length > 1 ? state.steps.filter((s) => s.id !== id) : state.steps
    })),

    updateSetField: (setId, field, value) => set((state) => ({
        steps: state.steps.map((s) => (s.id === setId && s.type !== "rest" ? { ...s, [field]: value } : s))
    })),

    toggleDropSets: (setId) => set((state) => {
        return {
            steps: state.steps.map((s) => {
                if (s.id !== setId || s.type === "rest") return s;
                if (s.dropSets && s.dropSets.length > 0) {
                    // Si ya tiene dropsets, eliminar el último (como estaba implementado)
                    return { ...s, dropSets: s.dropSets.slice(0, -1) };
                }
                // Si no tiene, añadir uno
                return {
                    ...s,
                    dropSets: [{
                        id: randomId(),
                        weight: s.weight,
                        reps: s.reps,
                        rir: s.rir,
                        partialReps: { count: "", rom: "", customRom: "" }
                    }]
                };
            })
        };
    }),

    addDropSet: (setId) => set((state) => ({
        steps: state.steps.map((s) => {
            if (s.id !== setId || s.type === "rest") return s;
            const lastDs = s.dropSets && s.dropSets.length > 0 ? s.dropSets[s.dropSets.length - 1] : s;
            const newDropSet = {
                id: randomId(),
                weight: lastDs.weight,
                reps: lastDs.reps,
                rir: lastDs.rir,
                partialReps: { count: "", rom: "", customRom: "" },
            };
            return { ...s, dropSets: [...(s.dropSets || []), newDropSet] };
        })
    })),

    deleteDropSet: (setId, dropSetId) => set((state) => ({
        steps: state.steps.map((s) => {
            if (s.id !== setId || s.type === "rest") return s;
            return { ...s, dropSets: s.dropSets?.filter((ds: any) => ds.id !== dropSetId) };
        })
    })),

    updateDropSetField: (setId, dropSetId, field, value) => set((state) => ({
        steps: state.steps.map((s) => {
            if (s.id !== setId || s.type === "rest") return s;
            return {
                ...s,
                dropSets: s.dropSets?.map((ds: any) => (ds.id === dropSetId ? { ...ds, [field]: value } : ds))
            };
        })
    })),

    updateDropSetPartialRepsField: (setId, dropSetId, field, value) => set((state) => ({
        steps: state.steps.map((s) => {
            if (s.id !== setId || s.type === "rest") return s;
            return {
                ...s,
                dropSets: s.dropSets?.map((ds: any) => ds.id === dropSetId ? { ...ds, partialReps: { ...ds.partialReps, [field]: value } } : ds)
            };
        })
    })),

    deletePartialReps: (setId, dropSetId) => set((state) => ({
        steps: state.steps.map((s) => {
            if (s.id !== setId || s.type === "rest") return s;
            if (dropSetId) {
                return {
                    ...s,
                    dropSets: s.dropSets?.map((ds: any) => ds.id === dropSetId ? { ...ds, partialReps: { count: "", rom: "", customRom: "" } } : ds)
                };
            }
            return { ...s, partialReps: { count: "", rom: "", customRom: "" } };
        })
    })),

    updatePartialRepsField: (setId, field, value) => set((state) => ({
        steps: state.steps.map((s) => {
            if (s.id !== setId || s.type === "rest") return s;
            return { ...s, partialReps: { ...s.partialReps, [field]: value } };
        })
    })),

    toggleNotes: (setId) => set((state) => ({
        steps: state.steps.map((s) => {
            if (s.id !== setId || s.type === "rest") return s;
            return { ...s, notes: { enabled: !s.notes.enabled, text: "" } };
        })
    })),

    updateNotes: (setId, note) => set((state) => ({
        steps: state.steps.map((s) => {
            if (s.id !== setId || s.type === "rest") return s;
            return { ...s, notes: { ...s.notes, text: note } };
        })
    }))
}));