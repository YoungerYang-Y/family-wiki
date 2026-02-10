const mermaidMock = {
  initialize: () => {},
  render: () => Promise.resolve({ svg: '<svg></svg>', bindFunctions: () => {} }),
};

export default mermaidMock;
