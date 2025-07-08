const express = require('express');
const router = express.Router();

// Get all website templates
router.get('/templates', (req, res) => {
  const templates = [
    {
      id: 'dr-michal-rosen',
      name: 'ד"ר מיכל רוזן',
      category: 'medical',
      subcategory: 'aesthetic',
      description: 'אתר מקצועי לרופאה אסתטית',
      price: 2800,
      status: 'active',
      features: ['booking', 'gallery', 'testimonials'],
      preview_url: '/websites/dr-michal-rosen/'
    },
    {
      id: 'danny-fit',
      name: 'דני פיט',
      category: 'fitness',
      subcategory: 'personal-trainer',
      description: 'אתר למאמן כושר אישי',
      price: 2200,
      status: 'active',
      features: ['programs', 'calculator', 'contact'],
      preview_url: '/websites/danny-fit/'
    },
    {
      id: 'studio-ohm',
      name: 'סטודיו אוהם',
      category: 'wellness',
      subcategory: 'yoga',
      description: 'אתר לסטודיו יוגה',
      price: 1900,
      status: 'active',
      features: ['classes', 'booking', 'meditation'],
      preview_url: '/websites/studio-ohm/'
    }
    // נוסיף את כל 11 האתרים
  ];

  res.json({
    success: true,
    count: templates.length,
    data: templates
  });
});

// Get single template
router.get('/templates/:id', (req, res) => {
  const { id } = req.params;
  
  // כרגע placeholder - מאוחר יותר נחבר לDB
  res.json({
    success: true,
    data: {
      id,
      message: `Template ${id} details - Coming from database soon!`
    }
  });
});

module.exports = router;
