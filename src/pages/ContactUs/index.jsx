import React from "react";
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
} from "@mui/material";
import Footer from "../../components/Footer";
import { Helmet } from "react-helmet-async";

const ContactUs = () => {
  return (
    <>
      <Helmet>
        <title>Contact Us | Knott's Jewelry</title>
        <meta
          name="description"
          content="Get in touch with Knott's Jewelry for questions, support, or custom orders."
        />
        <link
          rel="canonical"
          href="https://knotts-jewlery-xjku.vercel.app/contact"
        />
      </Helmet>

      <div className="contact-page">
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{ fontWeight: "bold", mb: 6 }}
          >
            Contact Us
          </Typography>

          <Grid container spacing={6}>
            <Grid item xs={12} md={6}>
              <Box>
                <Typography
                  variant="h5"
                  component="h2"
                  gutterBottom
                  sx={{ fontWeight: "bold", mb: 3 }}
                >
                  Get in Touch
                </Typography>

                <Typography variant="body1" paragraph>
                  Have questions about our products or need assistance with an
                  order? Our team is here to help you.
                </Typography>

                <Box sx={{ mt: 4 }}>
                  <Typography
                    variant="h6"
                    component="h3"
                    sx={{ fontWeight: "bold" }}
                  >
                    Customer Service
                  </Typography>
                  <Typography variant="body1">
                    Email: knottsjewlery@gmail.com
                  </Typography>
                  <Typography variant="body1">Phone: 0961599628</Typography>
                  <Typography variant="body1">
                    Hours: Monday - Friday, 08am - 9pm
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
        <Footer />
      </div>
    </>
  );
};

export default ContactUs;
