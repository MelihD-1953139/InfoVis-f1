import { useEffect } from "react";
import "./About.css";

function About() {
    return (
        <div class="about">
            <h1>About us</h1>
            <div><h2>Melih Demirel (melih.demirel@student.uhasselt.be)</h2><h2>Jeroen Weltens (jeroen.weltens@student.uhasselt.be)</h2></div>
            <p>We are Melih Demirel and Jeroen Weltens, 2 master students commputer science at Hasselt University.
                We made this project for our course Information Visualisation and chose the topic of formula one cause we are both fans of the sport.
                The goal of this project was to experiment with ways to display formula one data to gain a perspective of how drivers stack up to eachother.
                We made use of the Ergast api (https://ergast.com/mrd/) as well as the fastF1 python library (https://docs.fastf1.dev/) to make this project possible.
            </p>
        </div>
    );
}

export default About