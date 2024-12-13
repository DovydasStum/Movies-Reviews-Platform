import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import apiUrl from "../config/url";
import "../components/Design/Footer.css"; 

function Footer() {
    return (
        <footer className="footer">
            <p className="footerText">Movies Reviews Platform</p>
        </footer>
    );
}

export default Footer;
