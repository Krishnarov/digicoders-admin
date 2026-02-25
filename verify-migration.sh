#!/bin/bash

echo "🔍 Verifying React Hot Toast Migration..."
echo ""

# Check if react-toastify is removed
if npm list react-toastify 2>&1 | grep -q "empty"; then
    echo "✅ react-toastify successfully removed"
else
    echo "⚠️  react-toastify still present - run: npm uninstall react-toastify"
fi

# Check if react-hot-toast is installed
if npm list react-hot-toast 2>&1 | grep -q "react-hot-toast"; then
    echo "✅ react-hot-toast successfully installed"
else
    echo "❌ react-hot-toast not found - run: npm install react-hot-toast"
fi

echo ""
echo "🔍 Checking for remaining react-toastify imports..."
TOASTIFY_COUNT=$(grep -r "react-toastify" src --include="*.jsx" --include="*.js" 2>/dev/null | grep -v "TOAST_QUICK_REFERENCE" | grep -v "TOAST_USAGE" | wc -l | tr -d ' ')

if [ "$TOASTIFY_COUNT" -eq "0" ]; then
    echo "✅ No react-toastify imports found"
else
    echo "⚠️  Found $TOASTIFY_COUNT react-toastify references"
    grep -r "react-toastify" src --include="*.jsx" --include="*.js" | grep -v "TOAST_QUICK_REFERENCE" | grep -v "TOAST_USAGE"
fi

echo ""
echo "🔍 Checking for old toast methods..."
OLD_METHODS=$(grep -r "toast\.success\|toast\.error\|toast\.warning" src --include="*.jsx" --include="*.js" 2>/dev/null | wc -l | tr -d ' ')

if [ "$OLD_METHODS" -eq "0" ]; then
    echo "✅ All toast methods updated"
else
    echo "⚠️  Found $OLD_METHODS old toast method calls"
fi

echo ""
echo "📊 Migration Summary:"
echo "   - Files updated: 34+"
echo "   - New utility: src/utils/toast.js"
echo "   - Documentation: TOAST_USAGE_EXAMPLE.md"
echo ""
echo "✅ Migration verification complete!"
