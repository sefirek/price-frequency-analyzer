// import synaptic from 'synaptic';

const { Network, Layer, Neuron } = synaptic;

/**
 * @param {number[]} sizes
 * @returns {import('synaptic').Network}
 */
export default function createNetwork(...sizes) {
  const hidden = [];
  const input = new Layer(sizes[0]);
  hidden.push(input);
  let hiddenLayer = null;
  for (let i = 1; i < sizes.length - 1; i += 1) {
    hiddenLayer = new Layer(sizes[i]);
    hidden.push(hiddenLayer);
    hidden[i - 1].project(hiddenLayer);
  }
  hidden.shift();
  const output = new Layer(sizes[sizes.length - 1]);
  hiddenLayer.project(output);
  const network = new Network({ input, hidden, output });
  const neurons = network.neurons();
  neurons.forEach((neuron) => {
    neuron.neuron.squash = Neuron.squash.TANH;
  });
  return network;
}
