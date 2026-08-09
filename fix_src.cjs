const fs = require('fs');
function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = dir + '/' + file;
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if(file.endsWith('.jsx')) results.push(file);
        }
    });
    return results;
}

const files = walk('./src');
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace src={... || ''} with src={... || undefined}
    let modified = content.replace(/<img([^>]*)src=\{([^}]+?)\s*\|\|\s*(?:''|"")\}/g, '<img$1src={$2 || undefined}');
    
    // Replace src={p.avatar} with src={p.avatar || undefined}
    modified = modified.replace(/<img([^>]*)src=\{([^}|]+?)\}/g, (match, p1, p2) => {
        if (p2.includes('||') || p2.includes('?') || p2.includes('avatarFallback')) return match;
        if (p2.startsWith('`') || p2.startsWith("'") || p2.startsWith('"')) return match;
        return '<img' + p1 + 'src={' + p2 + ' || undefined}';
    });
    
    if (content !== modified) {
        fs.writeFileSync(file, modified, 'utf8');
        console.log('Fixed', file);
    }
});
