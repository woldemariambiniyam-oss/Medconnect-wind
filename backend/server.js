const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Route files
const auth = require('./routes/auth');
const users = require('./routes/users');
const doctors = require('./routes/doctors');
const appointments = require('./routes/appointments');
const prescriptions = require('./routes/prescriptions');
const pharmacies = require('./routes/pharmacies');
const medicines = require('./routes/medicines');
const payments = require('./routes/payments');
const notifications = require('./routes/notifications');
const verifications = require('./routes/verifications');

const app = express();

// Body parser
app.use(express.json());

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 100
});
app.use(limiter);

// Swagger setup
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Medconnect-wind API',
      version: '1.0.0',
      description: 'Healthcare platform API for connecting patients, doctors, and pharmacies in Ethiopia',
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:5000',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./routes/*.js'],
};

const specs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Mount routers
app.use('/api/auth', auth);
app.use('/api/users', users);
app.use('/api/doctors', doctors);
app.use('/api/appointments', appointments);
app.use('/api/prescriptions', prescriptions);
app.use('/api/pharmacies', pharmacies);
app.use('/api/medicines', medicines);
app.use('/api/payments', payments);
app.use('/api/notifications', notifications);
app.use('/api/verifications', verifications);

app.get('/', (req, res) => {
  res.json({ message: 'Medconnect-wind API' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
