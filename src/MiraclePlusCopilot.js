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
  const [domain, setDomain] = useState("");
  const [passion, setPassion] = useState("");
  const [name, setName] = useState("");

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
      const prompt = 
      `Task:
       Act as an expert in (${domain}) domain, help a startup to generate a business idea based on user's background, location, opportunities and passion:(${passion}). 
       Evaluate feasibility , using metrics such as product-market fit, TAM, cost, fundraising needs, and more. 
       Evaluate what you will do, why this idea is important, why now is the right time, how you will execute it, and why you are uniquely qualified to lead this venture for each idea.
       Output an HTML table in the user's language. Include personal analysis and co-founder suggestions. Multiple rows for multiple ideas. 
       Bold column title with light blue background. Make visuals aesthetically pleasing with good spacing. 
       Refer to the user by their name and use their resume (${portfolios}) to inform the evaluation.
       Evaluate each idea with its feasibility and briefly explain the factors contributing to the feasibility score.
       Output HTML for the below:
       Give out a analysis of this domain and potential chances
       Potential Business Ideas for (${name}) (#017dfe header, white text)
       1. [idea 1(give out the idea)] (bold, black text) 
       (1)first output as the normal font in bullet point, give a score out of 100 with an analysis for each of the below: Feasibility Score: -, Product Market Fit (PMF):  -, People Mission Fit(PMiF):  - , Market Potential:  - 
       (2)second, output as a table with #017dfe header & white text: what you will do, why this idea is important, why now is the right time, how you will execute it, and why you are uniquely qualified to lead this venture for each idea
       (3)third, give out The cofounder (${name}) should find (bold) - Where to find co-founders - 
       repeat for ideas 2

       Personal Analysis (large header)
       table with Factors, Score, Comments column (#017dfe header, white text)
       rows with Strengths, weaknesses, past experiences, storytelling (bold)
       `;


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
        <AppBar position="fixed">
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
          <Alert severity="info">We are in private beta.</Alert>
        </AppBar>
      </Box>
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
              margin: "10px 0",
              display: "flex",
              justifyContent: "center",
            }}
          ></div>


          <TextField
              id="outlined-multiline-static"
              label="Input your name"
              multiline
              width={3}
              rows={1}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
              }}
            />
          <div
            style={{
              margin: "10px 0",
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
            <TextField
              id="outlined-multiline-static"
              label="Input ideal domain..."
              multiline
              fullWidth
              rows={4}
              value={domain}
              onChange={(e) => {
                setDomain(e.target.value);
              }}
            />
            <TextField
              id="outlined-multiline-static"
              label="Input your passion..."
              multiline
              fullWidth
              rows={4}
              value={passion}
              onChange={(e) => {
                setPassion(e.target.value);
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
