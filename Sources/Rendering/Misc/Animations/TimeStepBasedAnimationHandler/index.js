import macro from 'vtk.js/Sources/macro';

// ----------------------------------------------------------------------------
// vtkTimeStepBasedAnimationHandler methods
// ----------------------------------------------------------------------------

function vtkTimeStepBasedAnimationHandler(publicAPI, model) {
  publicAPI.setCurrentTimeStep = (time) => {
    // TODO: snap to closest and check range ?
    // TODO: use indices instead ?
    if (model.timeSteps.includes(time)) {
      model.currentTimeStep = time;
      publicAPI.update();
    }
  };

  publicAPI.setData = (data) => {
    model.data = data;

    // Refresh timesteps
    if (data.timeSteps) {
      model.timeSteps = data.timeSteps.map((timeStep) => timeStep.time);
      model.timeRange = [
        model.timeSteps[0],
        model.timeSteps[model.timeSteps.length - 1],
      ];
      model.currentTimeStep = model.timeSteps[0];
    }
  };

  publicAPI.setScene = (
    scene,
    originalMetadata,
    applySettings,
    setCameraParameters,
    setBackground
  ) => {
    model.scene = scene;
    model.applySettings = applySettings;
    model.setCameraParameters = setCameraParameters;
    model.setBackground = setBackground;
    model.originalMetadata = originalMetadata;
  };

  publicAPI.update = () => {
    if (!model.data || !model.scene) {
      return;
    }
    const currentScene = model.data.timeSteps.find(
      (scene) => scene.time === model.currentTimeStep
    );
    // TODO: animate sources (wait for http series reader)
    // TODO: animate LUTs ?
    if (currentScene.camera) {
      const camera = { ...model.originalMetadata.camera };
      Object.assign(camera, currentScene.camera);
      model.setCameraParameters(camera);
    }
    if (currentScene.background) {
      model.setBackground(currentScene.background);
    }
    if (model.scene) {
      model.scene.forEach((sceneItem) => {
        const id = sceneItem.id;
        if (currentScene[id]) {
          const settings = { ...sceneItem.defaultSettings };
          Object.assign(settings, currentScene[id]);
          model.applySettings(sceneItem, settings);
        }
      });
    }
  };
}

// ----------------------------------------------------------------------------
// Object factory
// ----------------------------------------------------------------------------

const DEFAULT_VALUES = {
  // TODO: initialize empty ?
  timeSteps: [0.0],
  timeRange: [0.0, 0.0],
  currentTimeStep: 0.0,
  scene: null,
  data: null,
  setCameraParameters: null,
  setBackground: null,
  applySettings: null,
  originalMetadata: null,
};

export function extend(publicAPI, model, initialValues = {}) {
  Object.assign(model, DEFAULT_VALUES, initialValues);

  // Build VTK API
  macro.obj(publicAPI, model);

  macro.get(publicAPI, model, ['timeSteps', 'timeRange', 'currentTimeStep']);

  // Object methods
  vtkTimeStepBasedAnimationHandler(publicAPI, model);
}

export const newInstance = macro.newInstance(
  extend,
  'vtkTimeStepBasedAnimationHandler'
);

// ----------------------------------------------------------------------------

export default { newInstance, extend };
