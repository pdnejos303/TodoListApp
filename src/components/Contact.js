// src/components/Contact.js
import React from "react";
import { Container, Typography } from "@mui/material";

const Contact = () => {
  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>
        Contact Us
      </Typography>
      <Typography variant="body1" paragraph>
        If you have any questions, feel free to contact us through this page.
      </Typography>
    </Container>
  );
};

export default Contact;
