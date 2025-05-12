"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function HackSquat() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/jambe" className="flex items-center text-blue-500 hover:text-blue-700">
          <ArrowLeft className="mr-2" size={20} />
          Retour aux exercices des jambes
        </Link>
      </div>
      
      <h1 className="text-3xl font-bold mb-6">Hack Squat</h1>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="aspect-w-16 aspect-h-9">
          <video 
            controls 
            className="w-full"
            poster="/images/hack-squat-poster.jpg"
          >
            <source src="/videos/hack-squat.mp4" type="video/mp4" />
            Votre navigateur ne prend pas en charge la lecture de vidéos.
          </video>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Comment faire le Hack Squat</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-medium">Description</h3>
            <p className="text-gray-700">
              Le Hack Squat est un exercice de musculation qui cible principalement les quadriceps, 
              les fessiers et les ischio-jambiers. Il s'effectue sur une machine spécifique qui guide 
              le mouvement et permet de soulever des charges importantes en toute sécurité.
            </p>
          </div>
          
          <div>
            <h3 className="text-xl font-medium">Étapes d'exécution</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Positionnez-vous sur la machine Hack Squat, dos bien calé contre le dossier incliné.</li>
              <li>Placez vos pieds sur la plateforme à largeur d'épaules ou légèrement plus larges.</li>
              <li>Déverrouillez la sécurité de la machine et tenez fermement les poignées.</li>
              <li>Inspirez et descendez lentement en fléchissant les genoux jusqu'à ce qu'ils forment un angle d'environ 90 degrés.</li>
              <li>Poussez ensuite sur vos talons pour remonter à la position initiale tout en expirant.</li>
              <li>Répétez le mouvement pour le nombre de répétitions souhaité.</li>
            </ol>
          </div>
          
          <div>
            <h3 className="text-xl font-medium">Conseils techniques</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Gardez votre dos bien appuyé contre le dossier tout au long du mouvement.</li>
              <li>Ne laissez pas vos genoux s'affaisser vers l'intérieur pendant la descente.</li>
              <li>Adaptez le placement de vos pieds sur la plateforme pour cibler différentes parties des jambes.</li>
              <li>Contrôlez le mouvement, surtout lors de la descente.</li>
              <li>Évitez de verrouiller complètement vos genoux en position haute.</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-medium">Muscles sollicités</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li>Principalement : Quadriceps</li>
              <li>Secondairement : Fessiers, ischio-jambiers</li>
              <li>Stabilisateurs : Muscles du tronc</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-4">Variantes et adaptations</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li><strong>Hack squat pieds hauts</strong> : Placez vos pieds plus haut sur la plateforme pour solliciter davantage les ischio-jambiers et les fessiers.</li>
          <li><strong>Hack squat pieds serrés</strong> : Rapprochez vos pieds pour cibler plus intensément la partie externe des quadriceps.</li>
          <li><strong>Hack squat pieds écartés</strong> : Écartez davantage vos pieds pour travailler l'intérieur des cuisses.</li>
        </ul>
      </div>
    </div>
  );
}
