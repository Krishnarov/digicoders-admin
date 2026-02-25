#!/bin/bash

# React Hot Toast Migration Script

echo "🔄 Starting migration from react-toastify to react-hot-toast..."

# Step 1: Remove old package
echo "📦 Removing react-toastify..."
npm uninstall react-toastify

# Step 2: Install new package
echo "📦 Installing react-hot-toast..."
npm install react-hot-toast

echo "✅ Migration complete!"
echo ""
echo "📝 Next steps:"
echo "1. Update your imports from 'react-toastify' to use './utils/toast'"
echo "2. Replace toast.success() with showSuccess()"
echo "3. Replace toast.error() with showError()"
echo "4. Use apiWithToast() for API calls with automatic loading/success/error handling"
echo ""
echo "📖 Check TOAST_USAGE_EXAMPLE.md for detailed usage examples"
echo "📖 Check src/utils/toastExamples.js for practical examples"
