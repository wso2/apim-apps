import { Box, Grid, Typography } from "@mui/material";
import React from "react";
import Card from "./Card";
import CardActionArea from "./CardActionArea";
import CardContent from "./CardContent";
import Button from "../buttons/Button";

export default {
  title: "Components/Card",
  component: Card,
};

const testId = "card";

export const BgGrey = (args) => (
  <Box p={3}>
    <Grid container spacing={3}>
      {[1, 2, 3].map((num) => (
        <Grid item xs={12} md={4} lg={4} xl={3} key={num}>
          <Card boxShadow="dark" {...args} testId={`${testId}-${num}`}>
            <CardActionArea testId={`${testId}-${num}`}>
              <CardContent>
                <Typography gutterBottom variant="h5" component="h2">
                  Lizard
                </Typography>
                <Typography variant="body2" color="textSecondary" component="p">
                  Lizards are a widespread group of squamate reptiles, with over
                  6,000 species, ranging across all continents except Antarctica
                </Typography>
                <Box display="flex" mt={1} gap={1}>
                  <Button testId="share" size="small">
                    Share
                  </Button>
                  <Button testId="learn-more" size="small">
                    Learn More
                  </Button>
                </Box>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      ))}
    </Grid>
  </Box>
);

export const BgWhite = (args) => (
  <Card testId="template-card-white">
    <Box p={3}>
      <Grid container spacing={3}>
        {[4, 5, 6].map((num) => (
          <Grid item xs={12} md={4} lg={4} xl={3} key={num}>
            <Card boxShadow="light" {...args} testId={`${testId}-${num}`}>
              <CardActionArea testId={`${testId}-${num}`}>
                <CardContent>
                  <Typography gutterBottom variant="h5" component="h2">
                    Lizard
                  </Typography>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    component="p"
                  >
                    Lizards are a widespread group of squamate reptiles, with
                    over 6,000 species, ranging across all continents except
                    Antarctica
                  </Typography>
                  <Box display="flex" mt={1} gap={1}>
                    <Button testId="share" size="small" color="primary">
                      Share
                    </Button>
                    <Button testId="learn-more" size="small" color="primary">
                      Learn More
                    </Button>
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  </Card>
);

export const GrayCard = (args) => (
  <Card testId="template-card-white">
    <Box p={3}>
      <Grid container spacing={3}>
        {[4, 5, 6].map((num) => (
          <Grid item xs={12} md={4} lg={4} xl={3} key={num}>
            <Card
              boxShadow="none"
              {...args}
              testId={`${testId}-${num}`}
              bgColor="secondary"
            >
              <CardActionArea testId={`${testId}-${num}`}>
                <CardContent>
                  <Typography gutterBottom variant="h5" component="h2">
                    Lizard
                  </Typography>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    component="p"
                  >
                    Lizards are a widespread group of squamate reptiles, with
                    over 6,000 species, ranging across all continents except
                    Antarctica
                  </Typography>
                  <Box display="flex" mt={1} gap={1}>
                    <Button testId="share" size="small" color="primary">
                      Share
                    </Button>
                    <Button testId="learn-more" size="small" color="primary">
                      Learn More
                    </Button>
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  </Card>
);

export const SampleCard = (args) => (
  <Card testId="template-sample-card">
    <Box p={3}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4} lg={4} xl={3}>
          <Card {...args} testId={`${testId}-16`} fullHeight>
            <CardContent fullHeight>
              <Typography gutterBottom variant="h5" component="h2">
                Lizard
              </Typography>
              <Typography variant="body2" color="textSecondary" component="p">
                Lizards are a widespread group of squamate reptiles, with over
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4} lg={4} xl={3}>
          <Card {...args} testId={`${testId}-17`} fullHeight>
            <CardContent fullHeight>
              <Typography gutterBottom variant="h5" component="h2">
                Lizard
              </Typography>
              <Typography variant="body2" color="textSecondary" component="p">
                Lizards are a widespread group of squamate reptiles, with over
                6,000 species, ranging across all continents except Antarctica
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4} lg={4} xl={3}>
          <Card {...args} testId={`${testId}-18`} fullHeight>
            <CardContent fullHeight paddingSize="md">
              <Typography gutterBottom variant="h5" component="h2">
                Lizard (md)
              </Typography>
              <Typography variant="body2" color="textSecondary" component="p">
                Lizards are a widespread group of squamate reptiles, with over
                6,000 species, ranging across all continents except Antarctica
                widespread group of squamate reptiles, with over
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  </Card>
);
