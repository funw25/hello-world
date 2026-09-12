//下列程序的功能是使用字符指针访问字符串，
//并统计字符串中出现的单词的个数
//（单词以空格分隔，字符串开头没有空格，
//单词与单词之间只有一个空格，结尾没有空格）。

#include "stdio.h"
int main()
{
        char str[100], *pc;
        int count=0;
        pc=str;
        gets(pc);
        while(*pc!='\0')
        {
                if(*pc==' ')
                {
                        count++;
                }
                pc++;
        }
        printf("The number of words is %d\n",count+1);
        return 0;
}
