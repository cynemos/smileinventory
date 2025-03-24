import React from 'react';
import {
  LayoutDashboard,
  Users,
  Package,
  Activity,
  FileBarChart,
  Bell,
  Settings,
  HelpCircle,
} from 'lucide-react';

function Help() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Aide</h1>
      <p className="mb-4">Bienvenue sur la page d'aide de SmileInventory.</p>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2 flex items-center">
          <LayoutDashboard className="mr-2 text-primary-500" size={20} />
          Tableau de bord
        </h2>
        <p>Le tableau de bord vous offre une vue d'ensemble de votre activité.</p>
        <ul>
          <li>
            <b>Patients du jour:</b> Nombre de patients enregistrés aujourd'hui.
          </li>
          <li>
            <b>Nouveaux patients (30j):</b> Nombre de nouveaux patients enregistrés au
            cours des 30 derniers jours.
          </li>
          <li>
            <b>Produits à réapprovisionner:</b> Nombre de produits dont le stock est faible.
          </li>
          <li>
            <b>CA (30 derniers jours):</b> Chiffre d'affaires réalisé au cours des 30
            derniers jours.
          </li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2 flex items-center">
          <Users className="mr-2 text-primary-500" size={20} />
          Patients
        </h2>
        <p>La page Patients vous permet de gérer les informations de vos patients.</p>
        <ul>
          <li>Ajouter, modifier et supprimer des patients.</li>
          <li>Consulter l'historique des traitements de chaque patient.</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2 flex items-center">
          <Package className="mr-2 text-primary-500" size={20} />
          Inventaire
        </h2>
        <p>La page Inventaire vous permet de gérer votre stock de produits.</p>
        <ul>
          <li>Ajouter, modifier et supprimer des produits.</li>
          <li>Suivre les mouvements de stock.</li>
          <li>Gérer les fournisseurs.</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2 flex items-center">
          <Activity className="mr-2 text-primary-500" size={20} />
          Traitements
        </h2>
        <p>La page Traitements vous permet de gérer les traitements proposés.</p>
        <ul>
          <li>Ajouter, modifier et supprimer des traitements.</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2 flex items-center">
          <FileBarChart className="mr-2 text-primary-500" size={20} />
          Finance
        </h2>
        <p>La page Finance vous permet de suivre vos finances.</p>
        <ul>
          <li>Consulter les revenus et les dépenses.</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2 flex items-center">
          <Bell className="mr-2 text-primary-500" size={20} />
          Alertes
        </h2>
        <p>La page Alertes vous informe des produits en rupture de stock.</p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2 flex items-center">
          <Settings className="mr-2 text-primary-500" size={20} />
          Paramètres
        </h2>
        <p>La page Paramètres vous permet de modifier les paramètres de l'application.</p>
      </section>
    </div>
  );
}

export default Help;
