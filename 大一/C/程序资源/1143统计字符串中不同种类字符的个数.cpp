//本题要求实现一个函数，统计给定字符串中英文字母、空格、数字字符和其他字符的个数。
//void StringCount( char s[] );
//其中 char s[] 是用户传入的字符串。函数StringCount须在一行内按照
//letter = 英文字母个数, blank = 空格或回车个数, digit = 数字字符个数, other = 其他字符个数

#include <stdio.h>
#define MAXS 15 
void StringCount( char s[] );
void ReadString( char s[] );
int main()
{
    char s[MAXS];
 
    ReadString(s);
    StringCount(s);
 
    return 0;
}
void StringCount( char s[] )
{
	int letter=0,blank=0,digit=0,other=0;
	for(int i=0;s[i]!='\0';i++){
		if(s[i]<='z'&&s[i]>='a' || s[i]>='A'&&s[i]<='Z'){
			letter++;
		}
		else if(s[i]>='0'&&s[i]<='9'){
			digit++;
		}
		else if(s[i]==' '||s[i]=='\n'){
			blank++;
		}
		else{
			other++;
		}
	}
	printf("letter = %d, blank = %d, digit = %d, other = %d",letter,blank,digit,other);
}
void ReadString( char s[] )//读取字符串的函数 
{
	int i = 0;
    char ch;
    while ((ch = getchar())!= '\n' && i < MAXS - 1)
    {
        s[i++] = ch;//将每次读取到的字符 ch 存储到字符数组 s 中当前索引为 i 的位置上
    }
    s[i] = '\0';
}
