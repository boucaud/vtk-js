import 'vtk.js/Sources/favicon';

import vtkFullScreenRenderWindow from 'vtk.js/Sources/Rendering/Misc/FullScreenRenderWindow';
import vtkHttpSceneLoader from 'vtk.js/Sources/IO/Core/HttpSceneLoader';

import controlPanel from './controller.html';

// ----------------------------------------------------------------------------
// Standard rendering code setup
// ----------------------------------------------------------------------------

const fullScreenRenderer = vtkFullScreenRenderWindow.newInstance();
const renderer = fullScreenRenderer.getRenderer();
const renderWindow = fullScreenRenderer.getRenderWindow();

// ----------------------------------------------------------------------------
// Example code
// ----------------------------------------------------------------------------

function initialiseSelector(steps, applyStep) {
  const select = document.querySelector('#timeselect');
  select.addEventListener('change', () => {
    applyStep(select.selectedIndex);
  });
  steps.forEach((time) => {
    const option = document.createElement('option');
    option.setAttribute('value', time);
    option.innerText = `${time}`;
    select.appendChild(option);
  });
}

const sceneImporter = vtkHttpSceneLoader.newInstance({
  renderer,
  fetchGzip: true,
});

// TODO: reduce example size (remove some arrays)
sceneImporter.setUrl(`${__BASE_PATH__}/data/animatedScene`);
sceneImporter.onReady(() => {
  renderWindow.render();

  const animationHandler = sceneImporter.getAnimationHandler();
  global.animationHandler = animationHandler;

  if (animationHandler && animationHandler.getTimeSteps().length > 1) {
    const steps = animationHandler.getTimeSteps();

    const applyStep = (stepIdx) => {
      const step = steps[stepIdx];
      if (
        step >= animationHandler.getTimeRange()[0] &&
        step <= animationHandler.getTimeRange()[1]
      ) {
        animationHandler.setCurrentTimeStep(step);
        renderer.resetCameraClippingRange();
        renderWindow.render();
      }
    };
    initialiseSelector(steps, applyStep);
  }
});

// ----------------------------------------------------------------------------
// UI control handling
// ----------------------------------------------------------------------------

fullScreenRenderer.addController(controlPanel);

global.sceneLoader = sceneImporter;
global.renderWindow = renderWindow;
