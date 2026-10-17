const fs = require('fs');
let content = fs.readFileSync('src/features/common/components/Header.tsx', 'utf8');

// 1. Uncomment useAuth import
content = content.replace('// import { useAuth } from \'@/features/auth/hooks/useAuthSupabase\'', 'import { useAuth } from \'@/features/auth/hooks/useAuthSupabase\'');

// 2. Uncomment useAuth hook call
content = content.replace('// const { user, isAuthenticated, logout, isLoading } = useAuth()', 'const { user, isAuthenticated, logout, isLoading } = useAuth()');

// 3. Add missing icons
content = content.replace('import { Search, Heart, ShoppingCart, Menu, X, ChevronDown, Footprints, Shirt, Grid } from \'lucide-react\'', 'import { Search, Heart, ShoppingCart, Menu, X, ChevronDown, Footprints, Shirt, Grid, User, Settings, LogOut } from \'lucide-react\'');

// 4. Uncomment desktop auth links (Sign In / Sign Up)
content = content.replace(
`              {/* {isAuthenticated ? (
                <></>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 text-gray-300 hover:text-primary-500 hover:bg-primary-500/10 rounded-full transition-all duration-200 text-sm font-medium"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    className="px-4 py-2 bg-primary-500 text-black hover:bg-primary-400 rounded-full transition-all duration-200 text-sm font-medium"
                  >
                    Sign Up
                  </Link>
                </>
              )} */}`,
`              {isAuthenticated ? (
                <></>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 text-gray-300 hover:text-primary-500 hover:bg-primary-500/10 rounded-full transition-all duration-200 text-sm font-medium"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    className="px-4 py-2 bg-primary-500 text-black hover:bg-primary-400 rounded-full transition-all duration-200 text-sm font-medium"
                  >
                    Sign Up
                  </Link>
                </>
              )}`
);

// 5. Uncomment Desktop Profile dropdown
content = content.replace('              {/* {isAuthenticated && (', '              {isAuthenticated && (');
// The end of that block is at line 304
content = content.replace('              )} */}', '              )}');

// 6. Uncomment Mobile Profile/Auth Icon
content = content.replace('              {/* <div className="relative">', '              <div className="relative">');
content = content.replace('                  )}\\n                </AnimatePresence>\\n              </div> */}', '                  )}\\n                </AnimatePresence>\\n              </div>');
// Wait, the newlines in replace string might not match. Let's just use regex for the end tags
content = content.replace(/              \)} \*\/\}/g, '              )}');
content = content.replace(/                  \)} \*\/\}/g, '                  )}');

// Alternative for Mobile Profile/Auth Icon end tag
content = content.replace('              </div> */}', '              </div>');
content = content.replace('                  )} */}', '                  )}');
content = content.replace('                    ) : null} */}', '                    ) : null}');

// Mobile Auth Links start
content = content.replace('                  {/* {!isAuthenticated && (', '                  {!isAuthenticated && (');

// Mobile Account Links start
content = content.replace('                    {/* {isAuthenticated ? (', '                    {isAuthenticated ? (');

fs.writeFileSync('src/features/common/components/Header.tsx', content);
console.log('Done');
