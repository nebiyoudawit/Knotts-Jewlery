import React from "react";
import { Container, Typography, Box } from "@mui/material";
import Footer from "../../components/Footer";
import { Helmet } from "react-helmet-async";
const AboutUs = () => {
  return (
    <>
      <Helmet>
        <title>About Us | Knott's Jewelry</title>
        <meta
          name="description"
          content="Learn more about Knott's Jewelry, our mission, and our commitment to quality craftsmanship."
        />
        <link
          rel="canonical"
          href="https://knotts-jewlery-xjku.vercel.app/about"
        />
      </Helmet>

      <div className="about-page">
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{ fontWeight: "bold", mb: 4 }}
          >
            About Our Jewelry Store
          </Typography>

          <Box sx={{ mb: 6 }}>
            <Typography
              variant="h5"
              component="h2"
              gutterBottom
              sx={{ fontWeight: "bold" }}
            >
              Our Story
            </Typography>
            <Typography variant="body1" paragraph>
              Founded in 2010, our jewelry store began as a small family-owned
              business with a passion for creating exquisite, handcrafted
              pieces. What started as a humble workshop has grown into a
              renowned brand known for its quality craftsmanship and unique
              designs.
            </Typography>
          </Box>

          <Box sx={{ mb: 6 }}>
            <Typography
              variant="h5"
              component="h2"
              gutterBottom
              sx={{ fontWeight: "bold" }}
            >
              Our Craftsmanship
            </Typography>
            <Typography variant="body1" paragraph>
              Each piece in our collection is meticulously crafted by skilled
              artisans using only the finest materials. We take pride in our
              attention to detail and commitment to sustainable and ethical
              sourcing practices.
            </Typography>
          </Box>

          <Box sx={{ mb: 6 }}>
            <Typography
              variant="h5"
              component="h2"
              gutterBottom
              sx={{ fontWeight: "bold" }}
            >
              Our Mission
            </Typography>
            <Typography variant="body1" paragraph>
              We believe jewelry should tell a story - your story. Our mission
              is to create pieces that celebrate life's special moments and
              become cherished heirlooms passed down through generations.
            </Typography>
          </Box>
        </Container>

        <Footer />
      </div>
    </>
  );
};

export default AboutUs;
