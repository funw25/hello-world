//英文辅音字母是除A、E、I、O、U以外的字母。
//本题要求编写程序，统计给定字符串中大写辅音字母的个数。
//输入在一行中给出一个不超过80个字符、并以回车结束的字符串。
//输出在一行中给出字符串中大写辅音字母的个数。
#include"stdio.h" 
int main()
{
	char a[81];
	gets(a);
	int count=0;
	for(int i=0;a[i]!='\0';i++){
		if(a[i]>='A'&&a[i]<='Z'&& a[i]!='A'&& a[i]!='E'&& a[i]!='I'&& a[i]!='O'&& a[i]!='U'){
			count++;
		}
	}
	printf("%d",count);
	return 0;
}
