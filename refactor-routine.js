const fs = require('fs');

let rPath = '/home/scu/Projects/fitlog/screens/Routine/Routine.tsx';
let rContent = fs.readFileSync(rPath, 'utf8');

// Insert updateRestDuration, deleteStep, editExercise
rContent = rContent.replace(
  '  const addRest = () => {',
  `  const updateRestDuration = (id: string, duration: number) => {
    setRoutines(
      routines.map((r) =>
        r.id === routineId
          ? {
              ...r,
              steps: r.steps.map((s) => (s.id === id && s.type === "rest" ? { ...s, duration } : s)),
            }
          : r
      )
    );
  };

  const deleteStep = (id: string) => {
    setRoutines(
      routines.map((r) =>
        r.id === routineId
          ? { ...r, steps: r.steps.filter((s) => s.id !== id) }
          : r
      )
    );
  };

  const editExercise = (index: number, exerciseId: string) => {
    // Find contiguous range
    let startIndex = index;
    while (startIndex > 0 && routine.steps[startIndex - 1].type !== "rest" && routine.steps[startIndex - 1].exerciseId === exerciseId) {
      startIndex--;
    }
    let endIndex = index;
    while (endIndex < routine.steps.length - 1 && routine.steps[endIndex + 1].type !== "rest" && routine.steps[endIndex + 1].exerciseId === exerciseId) {
      endIndex++;
    }
    
    const exercise = EXERCISES.find((e) => e.exerciseId === exerciseId);
    navigation.navigate("exercise", { routineId, exercise, editMode: true, startIndex, endIndex });
  };

  const addRest = () => {`
);

// Replace Rest view with editable input and trash
rContent = rContent.replace(
  /          return \(\n            <View className="flex-row bg-neutral-200 items-center rounded p-2">\n              <Ionicons name="time-outline" size=\{12\} className="mr-1" \/>\n              <Text>Descanso<\/Text>\n              <Text> \{step.duration\} segundos<\/Text>\n            <\/View>\n          \);/g,
  `          return (
            <View key={step.id} className="flex-row items-center justify-between p-3 bg-neutral-200 rounded">
              <View className="flex-row items-center gap-2">
                <Ionicons name="time-outline" size={20} className="!text-neutral-500" />
                <Text className="text-neutral-600 font-medium">Descanso</Text>
              </View>
              <View className="flex-row items-center gap-2">
                <TextInput
                  className="bg-white px-3 py-1 rounded-md w-16 text-center font-bold"
                  keyboardType="numeric"
                  value={step.duration?.toString()}
                  onChangeText={(text) => updateRestDuration(step.id, parseInt(text) || 0)}
                />
                <Text className="text-neutral-500 text-sm">s</Text>
                <TouchableOpacity onPress={() => deleteStep(step.id)} className="ml-2">
                  <Ionicons name="trash-outline" size={20} className="!text-red-400" />
                </TouchableOpacity>
              </View>
            </View>
          );`
);

// Wrap exercise view with TouchableOpacity
rContent = rContent.replace(
  '<View className="bg-neutral-200 rounded p-3">',
  '<TouchableOpacity onPress={() => editExercise(index, step.exerciseId)} className="bg-neutral-200 rounded p-3" activeOpacity={0.7}>'
);
rContent = rContent.replace(
  /                  <\/View>\n                \)\}\n              <\/View>\n            \);\n          \}/g,
  `                  </View>
                )}
              </TouchableOpacity>
            );
          }`
);

fs.writeFileSync(rPath, rContent);

// Modify ExerciseScreen.tsx
let esPath = '/home/scu/Projects/fitlog/screens/ExerciseScreen/ExerciseScreen.tsx';
let esContent = fs.readFileSync(esPath, 'utf8');

// Replace addToRoutine
esContent = esContent.replace(
  /  const addToRoutine = \(\) => \{\n    const isNewRoutine = !routines\.some\(\(r\) => r\.id === routineId\);\n\n    if \(isNewRoutine\) \{\n      const newRoutine: Routine = \{\n        id: routineId,\n        name: "New Routine",\n        steps: \[\.\.\.steps\],\n      \};\n      setRoutines\(\[newRoutine, \.\.\.routines\]\);\n    \} else \{\n      const updatedRoutines = routines\.map\(\(r\) => \{\n        if \(r\.id === routineId\) \{\n          return \{ \.\.\.r, steps: \[\.\.\.r\.steps, \.\.\.steps\] \};\n        \}\n        return r;\n      \}\);\n      setRoutines\(updatedRoutines\);\n    \}\n    clearDraft\(\);\n    navigation\.goBack\(\);\n  \};/,
  `  const addToRoutine = () => {
    const isNewRoutine = !routines.some((r) => r.id === routineId);

    if (isNewRoutine) {
      const newRoutine: Routine = {
        id: routineId,
        name: "New Routine",
        steps: [...steps],
      };
      setRoutines([newRoutine, ...routines]);
    } else {
      const updatedRoutines = routines.map((r) => {
        if (r.id === routineId) {
          if (route.params.editMode && route.params.startIndex !== undefined) {
             const newSteps = [...r.steps];
             newSteps.splice(route.params.startIndex, route.params.endIndex - route.params.startIndex + 1, ...steps);
             return { ...r, steps: newSteps };
          } else {
             return { ...r, steps: [...r.steps, ...steps] };
          }
        }
        return r;
      });
      setRoutines(updatedRoutines);
    }
    clearDraft();
    navigation.goBack();
  };`
);

// Load draft if editMode
esContent = esContent.replace(
  '  useEffect(() => {\n    clearDraft();\n    setExercise(exercise);\n  }, [exercise]);',
  `  useEffect(() => {
    clearDraft();
    setExercise(exercise);
    
    if (route.params.editMode && route.params.startIndex !== undefined) {
      const routine = useRoutinesStore.getState().routines.find((r: any) => r.id === routineId);
      if (routine) {
        const editableSteps = routine.steps.slice(route.params.startIndex, route.params.endIndex + 1);
        setSteps(editableSteps);
      }
    }
  }, [exercise, route.params.editMode]);`
);

// Remove "Add Rest" button
esContent = esContent.replace(/<TouchableOpacity\n              onPress=\{addRest\}\n              className="mx-3 mb-3 flex-row items-center justify-center gap-2 rounded-md h-12 border border-neutral-200"\n            >\n              <Ionicons name="time-outline" size=\{18\} className="!text-neutral-600" \/>\n              <Text className="font-semibold text-sm text-neutral-600">AGREGAR DESCANSO<\/Text>\n            <\/TouchableOpacity>/, '');

// Remove rest rendering from ExerciseScreen
esContent = esContent.replace(/                if \(step\.type === "rest"\) \{\n                  return \(\n                    <View key=\{step\.id\} className="flex-row items-center justify-between p-3 bg-neutral-100 rounded-lg">\n                      <View className="flex-row items-center gap-2">\n                        <Ionicons name="time-outline" size=\{20\} className="!text-neutral-500" \/>\n                        <Text className="text-neutral-600 font-medium">Descanso<\/Text>\n                      <\/View>\n                      <View className="flex-row items-center gap-2">\n                        <TextInput\n                          className="bg-white px-3 py-1 rounded-md w-16 text-center font-bold"\n                          keyboardType="numeric"\n                          value=\{step\.duration\.toString\(\)\}\n                          onChangeText=\{\(text\) => updateRestDuration\(step\.id, parseInt\(text\) \|\| 0\)\}\n                        \/>\n                        <Text className="text-neutral-500 text-sm">s<\/Text>\n                        <TouchableOpacity onPress=\{\(\) => deleteStep\(step\.id\)\} className="ml-2">\n                          <Ionicons name="trash-outline" size=\{20\} className="!text-red-400" \/>\n                        <\/TouchableOpacity>\n                      <\/View>\n                    <\/View>\n                  \);\n                \}/, '');

// update header string "Agregar a la rutina" -> "Guardar cambios"
esContent = esContent.replace(/<Text className="text-white font-medium">Agregar a la rutina<\/Text>/, '{route.params.editMode ? <Text className="text-white font-medium">Guardar cambios</Text> : <Text className="text-white font-medium">Agregar a la rutina</Text>}');

fs.writeFileSync(esPath, esContent);
console.log('Script completed.');
