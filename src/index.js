import '@marcellejs/core/dist/marcelle.css';
import * as marcelle from '@marcellejs/core';

// function concatImageData(imageData1, imageData2, imageData3) {
// 	const canvas = document.createElement('canvas');
// 	const ctx = canvas.getContext('2d');
// 	canvas.width = imageData1.width + imageData2.width + imageData3.width;
// 	canvas.height = imageData1.height;
  
// 	const newImageData = ctx.createImageData(canvas.width, canvas.height);
  
// 	for (let y = 0; y < imageData1.height; y++) {
// 		for (let x = 0; x < imageData1.width; x++) {
// 			const i = (y * imageData1.width + x) * 4;
// 			newImageData.data[i] = imageData1.data[i];
// 			newImageData.data[i+1] = imageData1.data[i+1];
// 			newImageData.data[i+2] = imageData1.data[i+2];
// 			newImageData.data[i+3] = imageData1.data[i+3];
// 		}
// 	}
  
// 	for (let y = 0; y < imageData2.height; y++) {
// 	  	for (let x = 0; x < imageData2.width; x++) {
// 			const i = (y * imageData2.width + x) * 4;
// 			const j = (y * newImageData.width + x + imageData1.width) * 4;
// 			newImageData.data[j] = imageData2.data[i];
// 			newImageData.data[j+1] = imageData2.data[i+1];
// 			newImageData.data[j+2] = imageData2.data[i+2];
// 			newImageData.data[j+3] = imageData2.data[i+3];
// 	  	}
// 	}
  
// 	for (let y = 0; y < imageData3.height; y++) {
// 	  	for (let x = 0; x < imageData3.width; x++) {
// 			const i = (y * imageData3.width + x) * 4;
// 			const j = (y * newImageData.width + x + imageData1.width + imageData2.width) * 4;
// 			newImageData.data[j] = imageData3.data[i];
// 			newImageData.data[j+1] = imageData3.data[i+1];
// 			newImageData.data[j+2] = imageData3.data[i+2];
// 			newImageData.data[j+3] = imageData3.data[i+3];
// 	  	}
// 	}
  
// 	return newImageData;
// 	} 


// Images Input
const UpperInput = marcelle.imageUpload(Image={ width: 224, height: 224 });
UpperInput.title = 'Upload Upper body';

const LowerInput = marcelle.imageUpload(Image={ width: 224, height: 224 });
LowerInput.title = 'Uploead Lower body';

const ShoesInput = marcelle.imageUpload(Image={ width: 224, height: 224 });
ShoesInput.title = 'Uploead Shoes';

Promise.all([
	new Promise(resolve => { UpperInput.$images.onload = resolve }),
	new Promise(resolve => { LowerInput.$images.onload = resolve }),
	new Promise(resolve => { ShoesInput.$images.onload = resolve }),
  ]).then(() => {
	
	const canvas = document.createElement('canvas');

	// set canvas dimensions to fit all images
	canvas.width = UpperInput.$images.width + LowerInput.$images.width + ShoesInput.$images.width;
	canvas.height = Math.max(UpperInput.$images.height, LowerInput.$images.height, ShoesInput.$images.height);
  
	// get the canvas context
	const ctx = canvas.getContext('2d');
  
	// draw the images onto the canvas
	ctx.drawImage(UpperInput.$images, 0, 0);
	ctx.drawImage(LowerInput.$images, UpperInput.$images.width, 0);
	ctx.drawImage(ShoesInput.$images, UpperInput.$images.width + LowerInput.$images.width, 0);
  
	// convert canvas to stream image
	canvas.toBlob(blob => {
	  // do something with the resulting blob
	  console.log(blob);
	}, 'image/png');
  });
  
// Display Images Input
const UpperDisplay = marcelle.imageDisplay(UpperInput.$images);
UpperDisplay.title = 'Upper body';

const LowerDisplay = marcelle.imageDisplay(LowerInput.$images);
LowerDisplay.title = 'Lower body';

const ShoesDisplay = marcelle.imageDisplay(ShoesInput.$images);
ShoesDisplay.title = 'Shoes';


// Texts Input
const texture_label = marcelle.textInput();
texture_label.title = 'texture score';

const color_label = marcelle.textInput();
color_label.title = 'color score';

const shape_label = marcelle.textInput();
shape_label.title = 'shape score';


// Feature Extractor for Images input
const featureExtractor = marcelle.mobileNet();
featureExtractor.title = 'Feature Extractor for images';


// Instances
const capture = marcelle.button('Click to record an instance');
capture.title = 'Capture this outfit to training set';

const $instances = capture.$click
	.sample(UpperInput.$images)
//   .sample(UpperInput.$images, LowerInput.$images, ShoesInput.$images)
  .map(async (img) => ({
    x: await featureExtractor.process(img),
    y: parseInt(texture_label.$value.get()),
    thumbnail: UpperInput.$thumbnails.get(),
  }))
  .awaitPromises();


// Dataset
const store = marcelle.dataStore('localStorage');
const trainingSet = marcelle.dataset('TrainingSet', store);
const trainingSetBrowser = marcelle.datasetBrowser(trainingSet);

$instances.subscribe(trainingSet.create);


// Regresser Model
const regresser = marcelle.mlpRegressor({ layers: [32, 32], epochs: 20 });


// Training
const trainButton = marcelle.button('Click to train the model');
trainButton.title = 'Train';

trainButton.$click.subscribe(() => { regresser.train(trainingSet); });
const progress = marcelle.trainingProgress(regresser);


// Prediction
const predictButton = marcelle.button('Click to test');
predictButton.title = 'Let model rate this outfit!'


// Dashboard
const myDashboard = marcelle.dashboard({
	title: 'Outfit Rating',
	author: 'Dana Aubakirova, Dorin Doncenco, Zhe Huang, Heidi Sainte-Catherine',
	});

// First Page
myDashboard
	.page('Train outfit rating system')
	.sidebar(UpperInput, LowerInput, ShoesInput, featureExtractor)
	.use([UpperDisplay, LowerDisplay, ShoesDisplay])
	.use([texture_label, color_label, shape_label, capture])
	.use(trainButton, progress, trainingSetBrowser);

// Second Page
myDashboard
	.page('Test outfit rating system')
	.sidebar(UpperInput, LowerInput, ShoesInput, featureExtractor)
	.use([UpperDisplay, LowerDisplay, ShoesDisplay])
	.use(predictButton);
  
myDashboard.show();