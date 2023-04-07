import React, { useState, useEffect } from "react";
import styled from "styled-components";
import logo from "./miracleplus-logo.png";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";
import { Configuration, OpenAIApi } from "openai";
import Alert from "@mui/material/Alert";

import htmlToPdfmake from "html-to-pdfmake";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

import { useAuth0 } from "@auth0/auth0-react";

// Set the pdfMake fonts
pdfMake.vfs = pdfFonts.pdfMake.vfs;

const Header = styled.div`
  margin-top: 10rem;
`;

const Logo = styled.img`
  width: 7rem;
  height: 7rem;
  display: block;
  margin-left: auto;
  margin-right: auto;
`;

const ActionButton = styled.button`
  background-color: #017dfe;
  border: none;
  border-radius: 30px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  color: white;
  cursor: pointer;
  display: inline-block;
  font-weight: 700;
  font-size: 1.125rem;
  padding: 0.5rem 0.75rem;
  line-height: 50px;
  text-align: center;
  text-decoration: none;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
  position: relative;
  overflow: hidden;
  perspective: 1000px;
  transition: 0.3s;
  &:hover {
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.3);
  }
  &:active {
    transform: translateY(1px) rotateX(0deg);
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  }
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
  @media (min-width: 768px) {
    min-width: 120px;
    padding: 0 25px;
    font-size: 18px;
    line-height: 50px;
  }
`;

const configuration = new Configuration({
  apiKey: process.env.REACT_APP_MIRACLEPLUS_API_KEY,
});

const openai = new OpenAIApi(configuration);

const MiraclePlusCopilot = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [portfolios, setPortfolios] = useState("");
  const [ideas, setIdeas] = useState("");

  const callOpenAI = async (prompt) => {
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0,
    });
    return completion;
  };

  async function generateIdeas() {
    let onelineSummary;
    setIsLoading(true);
    try {
      const prompt = `Task: Generate potential business ideas based on an individual's background 
       and relevant industries, taking into account location factors and recent 
       developments and opportunities. Evaluate the feasibility of each idea, considering 
       factors such as product market fit, people mission fit, market potential, TAM, 
       cost, fundraising needs, and any other relevant factors.
      Output: An mobile responsive HTML table with each potential idea and a score out of 100 for its 
      feasibility, along with an explanation of the score and the metrics used to evaluate it.
      For each metric, make it out of 100. You don't have to use whole numbers. Provide a
      reasoning for each of the metrics instead of only providing a number. Include
      information of what types of co-founders the user should be looking for and 
      where they may find them. 
      If the resume inputted was in Chinese, generate the results in Chinese. Same with
      other languages.
      Follow up under the ideas section with a personal analysis table with strength and
      weakenesses, past experiences, storytelling, and any additional factors that may be relevant.
      After that, with a 30px margin top: Create visuals at the end of the 
      table for the personal analysis. Use a gradient that starts from white 
      and ends at (#017dfe). Use an arrow with label and a number indicator to point out 
      where each lands. Make sure the number lands on the bar.
      
      AT THE VERY END OF THE DOC with a 30px margin top: Create visuals at the end of the 
      table for relevance of the problem, usefullness of the solution, uniqueness, virality, 
      and willingness to buy using a light blue theme. Use a gradient that starts from white 
      and ends at (#017dfe). Use an arrow with label and a number indicator to point out 
      where each lands. Make sure the number lands on the bar.
      Refer to the user by their first name and use their resume (${portfolios}) to inform the evaluation.
      Multiple rows should be provided for multiple potential ideas.
      For each idea, evaluate its feasibility and include a brief explanation of the factors 
      that contribute to the feasibility score.
      The column title of the result table should be bold and have a light blue background (#017dfe).
      Make sure the text that is on white background does not blend in with the background.
      Make the visual aesthetically pleasing with good spacing.`;

      const res = await callOpenAI(prompt);
      onelineSummary = res.data.choices[0].message.content;
    } catch (error) {
      if (error.response) {
        console.error(error.response.status, error.response.data);
      } else {
        console.error(`Error with OpenAI API request: ${error.message}`);
      }
    }

    setIsLoading(false);
    return onelineSummary;
  }

  useEffect(() => {
    document.getElementsByTagName("title")[0].text = "MiraclePlus Copilot";
  });

  const exportToPDF = (content) => {
    const pdfContent = htmlToPdfmake(content);

    const documentDefinition = {
      content: pdfContent,
      pageSize: "LETTER",
      pageOrientation: "portrait",
      pageMargins: [40, 60, 40, 60],
    };

    pdfMake.createPdf(documentDefinition).download("exported-content.pdf");
  };

  // Auth0
  const {
    loginWithRedirect,
    loginWithPopup,
    logout,
    isAuthenticated,
    isLoading: authLoading,
  } = useAuth0();

  const login = () => loginWithPopup();

  return (
    <div>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              MiraclePlus
            </Typography>
            {authLoading && "Loading ..."}
            {!authLoading &&
              (isAuthenticated ? (
                <Button
                  color="inherit"
                  onClick={() =>
                    logout({
                      logoutParams: { returnTo: window.location.origin },
                    })
                  }
                >
                  Logout
                </Button>
              ) : (
                <Button color="inherit" onClick={() => login()}>
                  Login
                </Button>
              ))}
          </Toolbar>
        </AppBar>
      </Box>
      <Alert severity="info">We are in private beta.</Alert>
      <div className="container">
        <Header>
          <Logo src={logo} alt="listening" />
          <div style={{ marginTop: "50px", textAlign: "center" }}>
            <strong>
              Igniting your entrepreneurial spark with MiraclePlus by weaving
              your background into visionary startups with ChatGPT!
            </strong>
          </div>

          <div
            style={{
              margin: "50px 0",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <TextField
              id="outlined-multiline-static"
              label="Input your resume..."
              multiline
              fullWidth
              rows={4}
              value={portfolios}
              onChange={(e) => {
                setPortfolios(e.target.value);
              }}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "center" }}>
            {!isLoading ? (
              <>
                <ActionButton
                  disabled={isLoading ? true : false}
                  onClick={async () => {
                    if (!isAuthenticated) {
                      login();
                    }
                    isAuthenticated && setIdeas(await generateIdeas());
                  }}
                >
                  Generate Ideas
                </ActionButton>
                <ActionButton
                  style={{ marginLeft: "20px" }}
                  disabled={!ideas ? true : false}
                  onClick={() => {
                    exportToPDF(ideas);
                  }}
                >
                  Download PDF
                </ActionButton>
              </>
            ) : (
              <CircularProgress style={{ marginTop: "50px" }} />
            )}
          </div>

          <div
            style={{
              minHeight: "300px",
              marginBottom: "100px",
              marginTop: "50px",
            }}
          >
            {!isLoading && (
              <div
                dangerouslySetInnerHTML={{
                  __html: ideas,
                }}
              />
            )}
          </div>
        </Header>
      </div>
    </div>
  );
};

export default MiraclePlusCopilot;
