// import synaptic from 'synaptic';
import createNetwork from './createNetwork';

const { Trainer } = synaptic;

const network = createNetwork(4, 16, 1);

const trainingData = createRandomTrainingData(4, 100);

const copyData = JSON.parse(JSON.stringify(trainingData));
const trainer = new Trainer(network);

/**
 *
 */
export default function test() {
  trainer.train(copyData, {
    rate: 0.03,
    iterations: 1000,
    log: 10,
    error: 0.05,
    shuffle: false,
    cost: Trainer.cost.MSE,
  });
  trainingData.forEach(({ input, output }) => {
    const result = network.activate(input)[0];
    console.log({ result, expect: output[0] });
  });
}


/**
 * @param {number} inputSize
 * @param {number} count
 * @returns {{input:number[], output:number[]}[]}
 */
function createRandomTrainingData(inputSize, count) {
  const trainData = [];
  let data = 0;
  let randomData = 0;
  for (let i = 0; i < count; i += 1) {
    const input = [];
    for (let j = 0; j < inputSize; j += 1) {
      randomData = Math.random() * 2 - 1;
      data = randomData < -0.7 ? -1 : 0;
      data = randomData > 0.7 ? 1 : data;
      input.push(data);
    }
    randomData = Math.random() * 2 - 1;
    data = randomData < -0.7 ? -1 : 0;


    const output = [randomData > 0.7 ? 1 : data];
    trainData.push({ input, output });
  }
  return trainData;
}
