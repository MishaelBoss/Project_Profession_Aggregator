'use client'
import Image from "next/image";
import { useEffect } from 'react';
import "./listVacancies.css";
import { useRouter } from 'next/navigation'

interface Props{
    className?: string;
}

export const listVacancies: React.FC<Props> = ({ className }) => {
    return(
        <div className="div-cart-view-vacancies">
            <div className="div-cart-view-vacancies-content">
                <h1>Плотник</h1>
                <p></p>
                <p></p>
                <p></p>
            </div>
        </div>
    );
}