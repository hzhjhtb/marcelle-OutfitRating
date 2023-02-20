import '@marcellejs/core/dist/marcelle.css';
import * as marcelle from '@marcellejs/core';

// Main components
const UpperInput = marcelle.imageUpload(Image={ width: 224, height: 224 });
UpperInput.title = 'Upload Upper body';
const LowerInput = marcelle.imageUpload(Image={ width: 224, height: 224 });
LowerInput.title = 'Uploead Lower body';
const ShoesInput = marcelle.imageUpload(Image={ width: 224, height: 224 });
ShoesInput.title = 'Uploead Shoes';
// const featureExtractor = marcelle.mobileNet();
// featureExtractor.title = 'Feature Extractor';
// const trainingSet = marcelle.dataset('TrainingSet');
//

// Additional widgets and visualizations
const texture_label = marcelle.textInput();
texture_label.title = 'texture score';
const color_label = marcelle.textInput();
color_label.title = 'color score';
const shape_label = marcelle.textInput();
shape_label.title = 'shape score';

const capture = marcelle.button('Click to record an instance');
capture.title = 'Capture this outfit to training set';
const trainButton = marcelle.button('Click to train the model');
trainButton.title = 'Train';
const predictButton = marcelle.button('Click to test');
predictButton.title = 'Let model rate this outfit!'

const UpperDisplay = marcelle.imageDisplay(UpperInput.$images);
UpperDisplay.title = 'Upper body';
const LowerDisplay = marcelle.imageDisplay(LowerInput.$images);
LowerDisplay.title = 'Lower body';
const ShoesDisplay = marcelle.imageDisplay(ShoesInput.$images);
ShoesDisplay.title = 'Shoes';
// const progress = marcelle.trainingProgress();






const myDashboard = marcelle.dashboard({
	title: 'Outfit Rating',
	author: 'Dana Aubakirova, Dorin Doncenco, Zhe Huang, Heidi Sainte-Catherine',
	});

myDashboard
	.page('Train outfit rating system')
	.sidebar(UpperInput, LowerInput, ShoesInput)
	.use([UpperDisplay, LowerDisplay, ShoesDisplay])
	.use([texture_label, color_label, shape_label, capture])
	.use(trainButton);

myDashboard
	.page('Test outfit rating system')
	.sidebar(UpperInput, LowerInput, ShoesInput)
	.use([UpperDisplay, LowerDisplay, ShoesDisplay])
	.use(predictButton);
  
myDashboard.show();