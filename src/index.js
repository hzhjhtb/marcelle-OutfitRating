import '@marcellejs/core/dist/marcelle.css';
import * as marcelle from '@marcellejs/core';

// Images Input
const UpperInput = marcelle.imageUpload(Image={ width: 224, height: 224 });
UpperInput.title = 'Upload Upper body';
UpperInput.$images.subscribe((Upper_img) => { console.log('Upper_img', Upper_img); });

const LowerInput = marcelle.imageUpload(Image={ width: 224, height: 224 });
LowerInput.title = 'Uploead Lower body';
LowerInput.$images.subscribe((Lower_img) => { console.log('Lower_img', Lower_img); });

const ShoesInput = marcelle.imageUpload(Image={ width: 224, height: 224 });
ShoesInput.title = 'Uploead Shoes';
ShoesInput.$images.subscribe((Shoes_img) => { console.log('Shoes_img', Shoes_img); });


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
texture_label.$value.subscribe((texture_input) => { console.log('texture_label:', texture_input);} );

const color_label = marcelle.textInput();
color_label.title = 'color score';
color_label.$value.subscribe((color_input) => { console.log('color_label:', color_input);} );

const shape_label = marcelle.textInput();
shape_label.title = 'shape score';
shape_label.$value.subscribe((shape_input) => { console.log('shape_label:', shape_input);} );


// Feature Extractor for Images input
const featureExtractor = marcelle.mobileNet();
featureExtractor.title = 'Feature Extractor for images';


// Instances
const capture = marcelle.button('Click to record an instance');
capture.title = 'Capture this outfit to training set';

const $instances = capture.$click
  .sample(UpperInput.$images)
  .map(async (Upper_img) => ({
    x: await featureExtractor.process(Upper_img),
    y: [texture_label.$value.get(), color_label.$value.get(), shape_label.$value.get()],
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