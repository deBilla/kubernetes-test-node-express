import express from 'express';

const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Hello, TypeScript Express App!');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});