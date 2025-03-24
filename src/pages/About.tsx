import React from 'react';
import { Building2, Phone, Mail, Globe } from 'lucide-react';

function About() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">À Propos</h1>
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-2">Concepteur</h2>
        <div className="mb-4">
          <div className="flex items-center">
            <Building2 className="mr-2 text-gray-500" size={20} />
            <span className="font-medium">Cyril Nectoux</span>
          </div>
          <div className="flex items-center">
            <Mail className="mr-2 text-gray-500" size={20} />
            <a href="mailto:cnectoux@free.fr" className="text-primary-600 hover:text-primary-800">
              cnectoux@free.fr
            </a>
          </div>
          <div className="flex items-center">
            <Phone className="mr-2 text-gray-500" size={20} />
            <span>06.14.21.61.46</span>
          </div>
          <div className="flex items-center">
            <Globe className="mr-2 text-gray-500" size={20} />
            <a href="https://twitter.com/CYNEPROD" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-800">
              @CYNEPROD
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;
