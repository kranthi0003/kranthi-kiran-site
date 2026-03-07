import sys
p='style.css'
with open(p,'r',encoding='utf-8') as f:
    stack=[]
    for i,line in enumerate(f,1):
        for ch in line:
            if ch=='{': stack.append((i,line.strip()))
            elif ch=='}':
                if not stack:
                    print(f"Unmatched closing brace at line {i}: {line.strip()}")
                    sys.exit(2)
                stack.pop()
    if stack:
        for ln,txt in stack:
            print(f"Unclosed opening brace at line {ln}: {txt}")
        sys.exit(3)
print('Braces appear balanced')
