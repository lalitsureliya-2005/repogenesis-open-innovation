# Root Cause Analysis and Fix

The root cause of this issue is that the `fileURLToPath` function is not defined. To fix this, you can add the following line at the top of your code:

```javascript
import { fileURLToPath } from 'url';
```

Alternatively, you can use a different method to resolve file paths.