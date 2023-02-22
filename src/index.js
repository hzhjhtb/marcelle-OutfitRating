import '@marcellejs/core/dist/marcelle.css';
import * as marcelle from '@marcellejs/core';


function concatImageData(imageData1, imageData2, imageData3) {
	const canvas = document.createElement('canvas');
	canvas.width = Math.max(imageData1.width, imageData2.width, imageData3.width);
	canvas.height = imageData1.height + imageData2.height + imageData3.height;
	const ctx = canvas.getContext('2d');
	ctx.putImageData(imageData1, 0, 0);
	ctx.putImageData(imageData2, 0, imageData1.height);
	ctx.putImageData(imageData3, 0, imageData1.height + imageData2.height);
	return ctx.getImageData(0, 0, canvas.width, canvas.height);
	}

function imageDataToDataURL(imageData) {
	const canvas = document.createElement('canvas');
	canvas.width = imageData.width;
	canvas.height = imageData.height;
	const ctx = canvas.getContext('2d');
	ctx.putImageData(imageData, 0, 0);
	return canvas.toDataURL();
	}


// Images Input
const UpperInput = marcelle.imageUpload(Image={ width: 224, height: 224 });
UpperInput.title = 'Upload Upper body';

const LowerInput = marcelle.imageUpload(Image={ width: 224, height: 224 });
LowerInput.title = 'Uploead Lower body';

const ShoesInput = marcelle.imageUpload(Image={ width: 224, height: 224 });
ShoesInput.title = 'Uploead Shoes';

// Display Images Input
const UpperDisplay = marcelle.imageDisplay(UpperInput.$images);
UpperDisplay.title = 'Upper body';

const LowerDisplay = marcelle.imageDisplay(LowerInput.$images);
LowerDisplay.title = 'Lower body';

const ShoesDisplay = marcelle.imageDisplay(ShoesInput.$images);
ShoesDisplay.title = 'Shoes';


// Texts Input
const score_label = marcelle.textInput();
score_label.title = 'Outfit Score';


// Feature Extractor for Images input
const featureExtractor = marcelle.mobileNet();
featureExtractor.title = 'Feature Extractor for images';


// Instances
const capture = marcelle.button('Click to record an instance');
capture.title = 'Capture this outfit to training set';

const $instances = capture.$click
  	.sample(UpperInput.$images)
	.map(async (img1) => ({
		x: await featureExtractor.process(concatImageData(img1, LowerInput.$images.get(), ShoesInput.$images.get())),
		y: parseInt(score_label.$value.get()),
		thumbnail : imageDataToDataURL(concatImageData(img1, LowerInput.$images.get(), ShoesInput.$images.get()))
	}))
	  .awaitPromises();
  	

// Training Set
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

const $predictions = predictButton.$click
	.sample(UpperInput.$images)
  	.map(async (img1) => {
    	const features = await featureExtractor.process(concatImageData(img1, LowerInput.$images.get(), ShoesInput.$images.get()));
    	return regresser.predict(features);
  	})
  	.awaitPromises();

const result = marcelle.text('Waiting for predictions...');
result.title = 'Prediction for this outfit';

$predictions.subscribe((x) => { result.$value.set(parseInt(x)); });

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
	.use([score_label, capture])
	.use(trainingSetBrowser, trainButton, progress);

// Second Page
myDashboard
	.page('Test outfit rating system')
	.sidebar(UpperInput, LowerInput, ShoesInput, featureExtractor)
	.use([UpperDisplay, LowerDisplay, ShoesDisplay])
	.use([predictButton, result]);
  
myDashboard.show();