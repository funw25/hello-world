//从键盘输入一个字符串(长度小于80)，判断是否为回文
//如果是回文，输出Yes，否则输出No。
//回文是指正向、反向拼写都一样的字符串。
#include"stdio.h"
#include"string.h"
int main()
{
	int i,j;
	char a[81];
	scanf("%s",a);
	for(i=0,j=strlen(a)-1;i<=j;i++,j--)
	{
		if(a[i]!=a[j]){
			printf("No");
			break;
		}	
	}
	if(i>j)
	{
        printf("Yes");
    }
	return 0;
}//利用回文字符串是镜像的性质 
