# Suggested Commands for Temple Stay Project

## Development Commands
- `npm start` - Start Expo development server
- `npm run android` - Run on Android device/simulator
- `npm run ios` - Run on iOS device/simulator
- `npm run web` - Run web version
- `expo install <package>` - Install Expo-compatible packages

## System Commands (macOS)
- `ls -la` - List files with details
- `find . -name "*.tsx" -o -name "*.ts"` - Find TypeScript files
- `grep -r "searchTerm" src/` - Search in source files
- `git status` - Check git status
- `git add .` - Stage all changes
- `git commit -m "message"` - Commit changes

## Project Specific
- Check `src/screens/` for screen components
- Check `src/components/common/` for reusable components
- Check `src/services/` for API and business logic
- Check `src/types/index.ts` for type definitions

## Testing/Linting
- No specific lint/test commands configured yet
- Should add TypeScript check: `npx tsc --noEmit`